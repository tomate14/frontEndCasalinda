
export class Product{

     name: String;
     barcode: String;
     price: String;    
    
     constructor(barcode: String, name: String, price:String) {
          this.name = name;
          this.barcode = barcode;
          this.price = price;
     }
}