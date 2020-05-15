import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';
import Product from '@modules/products/infra/typeorm/entities/Product';
import Order from '@modules/orders/infra/typeorm/entities/Order';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    // TODO
    const { id } = request.params;
    console.log(id);
    const findOrders = container.resolve(FindOrderService);

    const orders = await findOrders.execute({ id });

    return response.json(orders);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    // TODO
    const {
      customer_id,
      products,
    }: {
      customer_id: string;
      products: Array<{ id: string; quantity: number }>;
    } = request.body;

    const createOrder = container.resolve(CreateOrderService);

    const order = await createOrder.execute({ customer_id, products });

    const { id, customer, created_at, order_products, updated_at } = order;

    const newList: {
      id: string;
      created_at: Date;
      order: Order;
      order_id: string;
      price: string;
      product: Product;
      product_id: string;
      quantity: number;
      updated_at: Date;
    }[] = [];

    order_products.forEach(value => {
      const valor = Number(value.price).toFixed(2);
      newList.push({
        id: value.id,
        created_at: value.created_at,
        order: value.order,
        order_id: value.order_id,
        price: valor,
        product: value.product,
        product_id: value.product_id,
        quantity: value.quantity,
        updated_at: value.updated_at,
      });
    });

    console.log(order, 'aquiiiiiiii');

    console.log({
      id,
      customer,
      created_at,
      updated_at,
      order_products: newList,
    });

    return response.json({
      id,
      customer,
      created_at,
      updated_at,
      order_products: newList,
    });
  }
}
