const express =require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app =express()

const port =process.env.PORT || 5000

//middleware
app.use(cors({
  origin:[,'https://restaurant-management-79b97.web.app'],
  
  credentials: true,
}));
app.use(express.json())
app.use(cookieParser())

const userlog =(req,res,next)=>{
  console.log(req.method,req.url);

  next()
}
const tokenVerefy =(req,res,next)=>{
  const token=req.cookies?.token
  // console.log(token);
  if(!token){
    return res.status(401).send({message:'unauthorized access'})
  }
  jwt.verify(token,process.env.SECRET_TOKEN,(err,decoded)=>{
    if(err){
      return res.send({message: 'unauthorized access'})
    }
    req.user=decoded
    next()
  })
  // next()
}

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
    const galleryCollection = client.db('Assignment').collection('gallery')

    app.get('/items',async(req,res)=>{
        const data =itemsCollection.find().sort({ count: -1 }).limit(6)
        const query={}
        const result =await data.toArray()
        res.send(result)
    })
    app.get('/itemsAll',userlog,async(req,res)=>{
      // console.log(req.cookies);
        const data =itemsCollection.find()
        const result =await data.toArray()
        res.send(result)
    })
    app.get('/gallery',tokenVerefy,async(req,res)=>{
      let query={}
      if(req.query?.email){
        query={email:req.query.email}
      }
        const data =galleryCollection.find(query)
        const result =await data.toArray()
        res.send(result)
    })
    app.post('/gallery/add',async(req,res)=>{
      const { name, image,description,email } = req.body;

      const newFoodItem = {
        name,
        image,
        description,
        email
      };

      const result =await galleryCollection.insertOne(newFoodItem)

      res.send(result)
    })
    app.put('/itemsAllCount/:id',async(req,res)=>{
      const {id}=req.params
      const {count,updateQuantity}=req.body
      // console.log(updateQuantity);

      const options = { upsert: false }
      
      const query ={_id: new ObjectId(id)}
      countUpdate={ $inc: { count: count},$set:{quantity:updateQuantity} }
  
      const result =await itemsCollection.updateOne(query,countUpdate,options)
      res.send(result)
        
    })
    app.put('/update/:id',async(req,res)=>{
      const { id } = req.params;
      const { name, price, description,category } = req.body


      const options = { upsert: false }
      const query = { _id: new ObjectId(id) }

      const updateDoc = {
        $set: {
          name,
          price,
          description,
          category,
        },
      };

      const result = await itemsCollection.updateOne(query, updateDoc,options)
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
    app.get('/purchase/new/:id',tokenVerefy,async(req,res)=>{
      const id=req.params.id
      const query ={_id: new ObjectId(id)}
      const result=await itemsCollection.findOne(query)
      res.send(result)
    })

    app.post('/purchase/data',async(req,res)=>{
      // if(req.user.email!==req.query.email){
      //   return res.status(403).send({message:'you cant access it'})
      // }
      const purchase =req.body
      const result =await purchaseCollection.insertOne(purchase)
      res.send(result)
    })
    app.delete('/purchase/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await purchaseCollection.deleteOne(query)
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
    app.post('/addfood',tokenVerefy,async(req,res)=>{
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
        count: 0
      };

      const result =await itemsCollection.insertOne(newFoodItem)

      res.send(result)
    })
    app.post('/jwt',async(req,res)=>{
      const user =req.body
      const token =jwt.sign(user,process.env.SECRET_TOKEN,{expiresIn:'1h'})
      res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'none'})
      res.send({success:true})
    })

    app.post('/logout',async(req,res)=>{
      const user=req.body
      res.clearCookie('token',{maxAge:0}).send({success:true})
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