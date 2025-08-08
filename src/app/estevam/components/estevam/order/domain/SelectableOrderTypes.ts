import { OrderProduct, OrderAdditional } from './OrderData';

export class SelectableOrderAdditional implements OrderAdditional {
  id: string | undefined;
  nome: string;
  valor: number;
  orderAdditionalId: string;
  _selected: boolean;

  constructor(adicional: OrderAdditional) {
    this.id = adicional.id;
    this.nome = adicional.nome;
    this.valor = adicional.valor;
    this.orderAdditionalId = adicional.orderAdditionalId;
    this._selected = false;
  }
}

export class SelectableOrderProduct implements OrderProduct {
  id: string | undefined;
  nome: string;
  valorUnitario: number;
  orderId: string;
  adicionais: SelectableOrderAdditional[];

  constructor(produto: OrderProduct) {
    this.id = produto.id;
    this.nome = produto.nome;
    this.valorUnitario = produto.valorUnitario;
    this.orderId = produto.orderId;
    this.adicionais = (produto.adicionais || []).map(
      (a) => new SelectableOrderAdditional(a)
    );
  }

  // Adicionamos a propriedade de seleção aqui
  _selected = false;
}
