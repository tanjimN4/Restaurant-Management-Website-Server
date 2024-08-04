const express =require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app =express()

const port =process.env.PORT || 5000

//middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hblj92w.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const itemsCollection = client.db('Assignment').collection('items')
    const purchaseCollection = client.db('Assignment').collection('purchase')

    app.get('/items',async(req,res)=>{
        const data =itemsCollection.find().limit(6)
        const result =await data.toArray()
        res.send(result)
    })
    app.get('/itemsAll',async(req,res)=>{
        const data =itemsCollection.find()
        const result =await data.toArray()
        res.send(result)
    })
    app.get('/itemsAll/email',async(req,res)=>{

      let query={}
      if(req.query?.email){
        query={email:req.query.email}
      }
        const data =itemsCollection.find(query)
        const result =await data.toArray()
        res.send(result)
    })

    app.get('/singlefood/:id',async(req,res)=>{
      const id=req.params.id
      const query ={_id: new ObjectId(id)}
      const result=await itemsCollection.findOne(query)
      res.send(result)
    })

    app.post('/purchase/data',async(req,res)=>{
      const purchase =req.body
      const result =await purchaseCollection.insertOne(purchase)
      res.send(result)
    })
    app.post('/purchase/data',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      res.send(result)
    })

    app.get('/purchase/data/email',async(req,res)=>{

      let query={}
      if(req.query?.email){
        query={email:req.query.email}
      }
        const data =purchaseCollection.find(query)
        const result =await data.toArray()
        res.send(result)
    })
    app.post('/addfood',async(req,res)=>{
      const { name, image, category, quantity, price, addedBy, email, origin, description } = req.body;

      const newFoodItem = {
        name,
        image,
        category,
        quantity,
        price,
        addedBy,
        email,
        origin,
        description,
        date: new Date(),
      };

      const result =await itemsCollection.insertOne(newFoodItem)

      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('working')
})

app.listen(port,()=>{
    console.log(`running ${port}`);  
})