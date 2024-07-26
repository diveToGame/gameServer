import { ApiProperty } from "@nestjs/swagger";

export class SignInResponseDTO {
  @ApiProperty({
    description: "email to sign-in.",
    type: String,
    example: "inwoo@gmail.com",
    required: true,
  })
  email: string;

  @ApiProperty({
    description: "username to sign-in.",
    type: String,
    example: "inwoo",
    required: true,
  })
  username: string;

  @ApiProperty({
    description: "token to connect with server.",
    type: String,
    example: "some encoded string",
    required: true,
  })
  ticket: string;
}
