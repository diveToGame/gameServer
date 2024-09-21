import { ApiProperty } from "@nestjs/swagger";

export class RegenerateTokenRequestDTO {
  @ApiProperty({
    description: "my secret refresh token",
    type: String,
    example: "Stroooong",
    required: true,
  })
  refreshToken: string;
}
