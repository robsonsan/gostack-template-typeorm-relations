import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const findCustomer = await this.customersRepository.findById(customer_id);

    if (!findCustomer) {
      throw new AppError('Customer not found');
    }

    const findedProducts = await this.productsRepository.findAllById(products);

    if (findedProducts.length !== products.length) {
      throw new AppError('Um ou mais produtos não existem');
    }

    findedProducts.forEach(pro => {
      const prodFind = products.find(prod => prod.id === pro.id);
      if (prodFind) {
        if (pro.quantity < prodFind?.quantity) {
          throw new AppError('Quantidade em estoque insuficiente');
        }
      }
    });

    const productsToSend: {
      product_id: string;
      price: number;
      quantity: number;
    }[] = [];

    const quantitiesProductUpdate: IUpdateProductsQuantityDTO[] = [];

    findedProducts.forEach(prod => {
      const prodFind = products.find(pro => pro.id === prod.id);
      if (prodFind) {
        productsToSend.push({
          product_id: prod.id,
          price: prod.price,
          quantity: prodFind.quantity,
        });

        quantitiesProductUpdate.push({
          id: prod.id,
          quantity: prodFind.quantity,
        });
      }
    });

    await this.productsRepository.updateQuantity(quantitiesProductUpdate);

    const newOrder = await this.ordersRepository.create({
      customer: findCustomer,
      products: productsToSend,
    });

    return newOrder;
  }
}

export default CreateProductService;
