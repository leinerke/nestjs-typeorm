import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dtos/products.dtos';
import { BrandsService } from './brands.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private brandService: BrandsService,
  ) {}

  findAll() {
    return this.productRepo.find({
      relations: ['brand'],
    });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(data: CreateProductDto) {
    try {
      // const newProduct = new Product();
      // newProduct.name = data.name;
      // newProduct.description = data.description;
      // newProduct.price = data.price;
      // newProduct.stock = data.stock;
      // newProduct.image = data.image;
      const newProduct = this.productRepo.create(data);
      if (data.brandId) {
        newProduct.brand = await this.brandService.findOne(data.brandId);
      }
      return await this.productRepo.save(newProduct);
    } catch (e) {
      console.error(e.message);
      throw new BadRequestException();
    }
  }

  async update(id: number, changes: UpdateProductDto) {
    const product = await this.productRepo.findOne(id);
    if (changes.brandId) {
      const brand = await this.brandService.findOne(changes.brandId);
      product.brand = brand;
    }
    this.productRepo.merge(product, changes);
    return this.productRepo.save(product);
  }

  remove(id: number) {
    return this.productRepo.delete(id);
  }
}
