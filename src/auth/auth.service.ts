import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { SignInRequestDTO } from "./dto/request/auth.sign-in.request.dto";
import { SignUpRequestDTO } from "./dto/request/auth.sign-up.request.dto";
import { SignInResponseDTO } from "./dto/response/auth.sign-in.response.dto";
import { SignUpResponseDTO } from "./dto/response/auth.sign-up.response.dto";
import { Ticket } from "./vo/auth.ticket.vo";
import {
  Observable,
  from,
  map,
  filter,
  iif,
  of,
  EMPTY,
  OperatorFunction,
  pipe,
  operate,
  createOperatorSubscriber,
  switchMap,
  throwError,
  UnaryFunction,
  mergeMap,
  concatMap,
} from "rxjs";
import { TaskSchedulerService } from "src/common/common.task-scheduler.service";
import { ConfigService } from "@nestjs/config";
import { UserVO } from "src/user/vo/user.vo";

@Injectable()
export class AuthService {
  private accoutMap = new Map<string, Ticket>();
  private ticketMap = new Map<Ticket, string>();

  constructor(
    private readonly userService: UserService,
    private readonly taskSchedulerService: TaskSchedulerService,
    private readonly configService: ConfigService
  ) {}

  getUsername(email: string): Observable<string> {
    return from(this.userService.findOne(email)).pipe(map((data) => data.username));
  }

  generateTicket(user: UserVO): Observable<SignInResponseDTO> {
    const ticket: Ticket = { value: randomBytes(32).toString("base64") };

    this.accoutMap.set(user.email, ticket);
    this.ticketMap.set(ticket, user.email);
    return of({
      email: user.email,
      username: user.username,
      ticket: ticket.value,
    });
  }

  reuseTicket(user: UserVO): Observable<SignInResponseDTO> {
    return of({
      email: user.email,
      username: user.username,
      ticket: this.accoutMap.get(user.email).value,
    });
  }

  compareIf<T, R>(p1: string, p2: string, successResult: Observable<T>, failResult: Observable<R>): Observable<T | R> {
    // eslint-disable-next-line prettier/prettier
    return from(bcrypt.compare(p1, p2)).pipe(concatMap((x) => iif(() => x, successResult, failResult)));
  }

  signIn({ email, password }: SignInRequestDTO) {
    return (
      this.userService
        .findOne(email)
        // eslint-disable-next-line prettier/prettier
        .pipe(
          // eslint-disable-next-line prettier/prettier
          concatMap((x) =>
            iif(
              () => this.accoutMap.has(x.email),
              this.reuseTicket(x),
              // eslint-disable-next-line prettier/prettier
              this.compareIf(
                password,
                x.password,
                this.generateTicket(x),
                throwError(() => new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED))
              )
            )
          )
        )
    );
  }

  async signOut(ticket: Ticket) {
    const account = this.ticketMap.get(ticket);
    this.ticketMap.delete(ticket);
    this.accoutMap.delete(account);
  }

  async signUp(signUpDTO: SignUpRequestDTO): Observable<SignUpResponseDTO> {
    const salt = bcrypt.genSaltSync();
    const hashPassword = await bcrypt.hash(signUpDTO.password, salt);

    const userVO = { ...signUpDTO };
    userVO.password = hashPassword;
    return { email: await this.userService.insert(userVO) };
  }

  async validateTicket(ticket: Ticket): Observable<boolean> {
    if (this.ticketMap.has(ticket)) return true;
    return false;
  }

  // call it when websocket disconnected
  async reserveToExpireTicket(ticket: Ticket) {
    this.taskSchedulerService.scheduleTask(
      ticket.value,
      () => {
        const email = this.ticketMap.get(ticket);

        this.ticketMap.delete(ticket);
        this.accoutMap.delete(email);
      },
      this.configService.get("TICKET_EXPIRE_DELAY_MILLISECONDS")
    );
    this.ticketMap.delete(ticket);
  }

  async cancelTicketExpire(ticket: Ticket) {
    this.taskSchedulerService.cancelTask(ticket.value);
  }
}
