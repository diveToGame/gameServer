import { ApiProperty } from "@nestjs/swagger";

export class RegenerateTokenResponseDTO {
  @ApiProperty({
    description: "my secret access token",
    type: String,
    example: "Stroooong access token",
    required: true,
  })
  accessToken: string;

  @ApiProperty({
    description: "my secret refresh token",
    type: String,
    example: "Stroooong refresh token",
    required: true,
  })
  refreshToken: string;
}
