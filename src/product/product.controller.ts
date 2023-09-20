import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile , Res } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {Response} from "express";

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    const fileExt = file?.mimetype?.split("/")[1];
    const fileGen = `${Date.now()}.${fileExt}`;
    cb(null, fileGen);
  }
});

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @UseInterceptors(FileInterceptor("Image", {
    storage: storage
  }))
  create(@UploadedFile() file: Express.Multer.File, @Body() createProductDto: CreateProductDto) {
    return this.productService.create(file, createProductDto);
  }

  @Get()
  findAll(@Res() res: Response) {
    return this.productService.findAll(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string , @Res() res: Response) {
    return this.productService.findOne(+id , res);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor("Image", {
    storage: storage
  }))
  update(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto , @Res() res: Response) {
    return this.productService.update(file, +id, updateProductDto , res);
  }

  @Delete(':id')
  remove(@Param('id') id: string , @Res() res: Response) {
    return this.productService.remove(+id , res);
  }
}
