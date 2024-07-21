import { ApiProperty } from "@nestjs/swagger";

export class TestDTO {
  @ApiProperty({
    example: "hello world",
  })
  msg: string;
}
