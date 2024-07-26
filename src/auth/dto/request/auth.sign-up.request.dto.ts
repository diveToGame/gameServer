import { ApiProperty } from "@nestjs/swagger";

export class SignUpRequestDTO {
  @ApiProperty({
    description: "email to sign-up, this should be unique",
    type: String,
    example: "inwoo@gmail.com",
    required: true,
  })
  email: string;

  @ApiProperty({
    description: "username to display in game",
    type: String,
    example: "Inwoo-The-Best",
    required: true,
  })
  username: string;

  @ApiProperty({
    description: "password of account",
    type: String,
    example: "1234",
    required: true,
  })
  password: string;
}
