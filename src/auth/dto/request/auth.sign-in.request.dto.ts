import { ApiProperty } from "@nestjs/swagger";

export class SignInRequestDTO {
  @ApiProperty({
    description: "E-mail to sign in, this should be a unique.",
    type: String,
    example: "inwoo@gmail.com",
    required: true,
  })
  email: string;

  @ApiProperty({
    description: "Password to sign in",
    type: String,
    example: "1234",
    required: true,
  })
  password: string;
}
