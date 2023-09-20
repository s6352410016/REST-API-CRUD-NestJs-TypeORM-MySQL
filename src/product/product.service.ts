import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as fs from "fs/promises";
import * as path from 'path';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) { }

  create(file: Express.Multer.File, createProductDto: CreateProductDto) {
    const { productName, productPrice } = createProductDto;
    const product = this.productRepository.create({
      productName: productName,
      productPrice: productPrice,
      productImage: file?.filename,
    });
    return this.productRepository.save(product);
  }

  async findAll(res: Response) {
    const product = await this.productRepository.find();
    if (product.length !== 0) {
      return res.status(200).json(product);
    }
    return res.status(404).json({ msg: "product not found." });
  }

  async findOne(id: number, res: Response) {
    const product = await this.productRepository.findOneBy({ id });
    if (product) {
      return res.status(200).json(product);
    }
    return res.status(404).json({ msg: "product not found." });
  }

  async update(file: Express.Multer.File, id: number, updateProductDto: UpdateProductDto, res: Response) {
    const { productName, productPrice } = updateProductDto;
    const product = await this.productRepository.findOneBy({ id });
    if (product) {
      if (file) {
        await fs.unlink(path.join(process.cwd(), `./images/${product.productImage}`));
        await this.productRepository.update(
          {
            id: id
          },
          {
            productName: productName,
            productPrice: productPrice,
            productImage: file?.filename,
          }
        );
        return res.status(200).json({ msg: "product updated successfully." });
      }

      await this.productRepository.update(
        {
          id: id
        },
        {
          productName: productName,
          productPrice: productPrice,
        }
      );
      return res.status(200).json({ msg: "product updated successfully." });
    }
    return res.status(404).json({ msg: "product not found." });
  }

  async remove(id: number, res: Response) {
    const product = await this.productRepository.findOneBy({ id });
    if (product) {
      await fs.unlink(path.join(process.cwd(), `./images/${product.productImage}`));
      await this.productRepository.delete(id);
      return res.status(200).json({ msg: "product deleted successfully." });
    }
    return res.status(404).json({ msg: "product not found." });
  }
}
