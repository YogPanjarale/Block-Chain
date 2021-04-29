import * as crypto from "crypto";
import { send } from "process";

let get_random = function (list:any[]) {
    return list[Math.floor((Math.random()*list.length))];
  } 
let get_randomcost= (min:number,max:number) => { return Math.floor(Math.random() * (max - min + 1) + min) };

class Transaction {
  constructor(
    public amount: number,
    public payer: string, //public key
    public payee: string //public key
  ) {}
  toString() {
    return JSON.stringify(this);
  }
}
class Block {

    public nonce =Math.round(Math.random()*9999999999 )

  constructor(
    public prevHash: string,
    public transaction: Transaction,
    public ts = Date.now()
  ) {}
  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    return hash.digest("hex");
  }
}

class Chain {
  public static instance = new Chain();

  chain: Block[];
  constructor() {
    this.chain = [new Block('', new Transaction(100, "genesis", "satoshi"))];
  }
  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Proof of work system
  mine(nonce: number) {
    let solution = 1;
    console.log("⛏️  mining...");

    while (true) {
      const hash = crypto.createHash("MD5");
      hash.update((nonce + solution).toString()).end();

      const attempt = hash.digest("hex");

      if (attempt.substr(0, 4) === "0000") {
        console.log(`Solved: ${solution}`);
        return solution;
      }

      solution += 1;
    }
  }
  addBlock(
    transaction: Transaction,
    senderPublicKey: string,
    signature: Buffer
  ) {
    const verifier = crypto.createVerify("SHA256");
    verifier.update(transaction.toString());

    const isValid = verifier.verify(senderPublicKey, signature);

    if (isValid) {
      const newBlock = new Block(this.lastBlock.hash, transaction);
      this.mine(newBlock.nonce);
      this.chain.push(newBlock);
    }
  }
}
class Wallet {
  public publicKey: string;
  public privateKey: string;
  constructor() {
    const keypair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    this.privateKey = keypair.privateKey;
    this.publicKey = keypair.publicKey;
  }
  sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
    const sign = crypto.createSign("SHA256");
    sign.update(transaction.toString()).end();
    const signature = sign.sign(this.privateKey);
    Chain.instance.addBlock(transaction, this.publicKey, signature);
  }
}

interface Person{
    wallet:Wallet,
    name:string
}
//Usage
const names = ["Sandra Lucas", "Rodney Durham", "Trystan Fenton", "Nabeela Knowles", "Kelis Guy", "Torin Frederick", "Dione Redman", "Tammy Li", "Nikola Johnston", "Maverick Devlin", "Joanne Malone", "Kunal Watson", "Matilda Fellows", "Jackson Barber", "Lila Mellor", "Lily-Mai Reynolds", "Mattie Macgregor", "Logan Mcclain", "Thomas Wilson", "Brianna Duarte","Keon Busby", "Areebah Perry", "Rick Jacobson", "Cherry Lake", "Reef Terrell", "Daisy O'Reilly", "Liberty Bloggs", "Corban Mccartney", "Jayda Brooks", "Darrel Kouma", "Rufus Bond", "Eshaal Norton", "Harvir Mackay", "Mikayla Flower", "Aneurin Vickers", "Rahim Bowes", "Elisabeth Guy", "Alberto Lyons", "Chad Burt", "Raees Shepherd", "Mohammad Driscoll", "Ayman Melia", "Michele Winters", "Ellis Lyon", "Zaki Rubio", "Claire Ryan", "Kalum Alford", "Jace Velasquez", "Mert Sosa", "Hajra Williams", "Jonny Crouch", "Ida Glenn", "Md Gaines", "Kadeem Fuller", "Lilly-Mai Kramer", "Cinar Hamer", "Bronwyn Robson", "Vivian Fuentes", "Danyl Espinoza", "Ayla Ruiz", "Andre Marsh", "Yehuda Anderson", "Leoni Hughes", "Connar Haas", "Kush Delarosa", "Hawwa Lees", "Bethaney Hays", "Steffan Marin", "Jordon Henry", "Fiza Kaufman"]
let x= []
for (let i=0;i<names.length;i++){
    x.push({name:names[i],wallet:new Wallet()})
}
let Everyone: Person[]= x
const satoshi =new Wallet();
const bob = new Wallet();
const alice = new Wallet();
console.log("Everyone:")
Everyone.forEach(i=>{
    console.log(i.name)
})
for (let  i =0;i<15;i++){
    let a= Everyone
    let sender:Person=get_random(a)
    let reciver:Person=get_random(a)
    let tries=0
    while ( sender == reciver ){
        reciver=get_random(a)
        if (tries>a.length){
            break
        }
        tries++
    }
    let rw= reciver.wallet
    let mtosend=get_randomcost(20,100)//money to send
    console.log(`${sender.name} sent ${mtosend/20}₿  to ${reciver.name} `)
    sender.wallet.sendMoney(mtosend,rw.publicKey)
    
}
// satoshi.sendMoney(50, bob.publicKey);
// bob.sendMoney(50, alice.publicKey);
// alice.sendMoney(50, bob.publicKey);


console.log(Chain.instance)