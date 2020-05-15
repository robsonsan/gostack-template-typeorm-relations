import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    // TODO
    const order = this.ormRepository.create({
      customer,
      order_products: products,
    });

    const orderToSend = await this.ormRepository.save(order);

    return orderToSend;
  }

  public async findById(id: string): Promise<Order | undefined> {
    // TODO
    console.log(id);
    const findOrder = await this.ormRepository.findOne(id, {
      relations: ['customer', 'order_products'],
    });

    console.log(findOrder?.customer);
    const antesDoArmengue: Array<any> = [];

    findOrder?.order_products.forEach(value => {
      antesDoArmengue.push({
        id: value.id,
        price: value.price.toFixed(2),
        product_id: value.product_id,
        quantity: value.quantity,
      });
    });

    const armengue = {
      customer: findOrder?.customer,
      order_products: antesDoArmengue,
    };

    console.log(findOrder?.customer);

    return armengue as Order | undefined;
  }
}

export default OrdersRepository;
