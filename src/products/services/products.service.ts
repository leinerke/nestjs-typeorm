import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateProductDto,
  FilterProductsDto,
  UpdateProductDto,
} from '../dtos/products.dtos';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
  ) {}

  findAll(params?: FilterProductsDto) {
    if (!!params) {
      const { limit, offset } = params;
      return this.productRepo.find({
        relations: ['brand'],
        take: limit,
        skip: offset,
      });
    }
    return this.productRepo.find({
      relations: ['brand'],
    });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne(id, {
      relations: ['brand', 'categories'],
    });
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
        newProduct.brand = await this.brandRepo.findOne(data.brandId);
      }

      if (data.categoriesIds) {
        newProduct.categories = await this.categoryRepo.findByIds(
          data.categoriesIds,
        );
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
      product.brand = await this.brandRepo.findOne(changes.brandId);
    }
    if (changes.categoriesIds) {
      product.categories = await this.categoryRepo.findByIds(
        changes.categoriesIds,
      );
    }
    this.productRepo.merge(product, changes);
    return this.productRepo.save(product);
  }

  remove(id: number) {
    return this.productRepo.delete(id);
  }
}
