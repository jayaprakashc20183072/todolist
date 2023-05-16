//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://jayaprakashc456:newpassword123@cluster0.eio3wiw.mongodb.net/todolistDB",{ useNewUrlParser: true});

const itemsScheme = 
  {
    name: String
  };

const Item = mongoose.model("Item",itemsScheme);
const listSchema = {
  name: String,
  items: [itemsScheme]
};
const List = mongoose.model("List",listSchema);

const item1 = new Item(
  {
    name: "Welcome to your todolist!"
  }
)
const item2 = new Item(
  {
    name: "Hit the + button to add a new item"
  }
)
const item3 = new Item(
  {
    name: "<-- Hit this to delete an item"
  }
)
const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {

  Item.find().then(function(items){
    if(items.length===0){
      Item.insertMany([{name: "Welcome to your todolist!"},{name: "Hit the + button to add a new item"},{name: "<-- Hit this to delete an item"}]).then(function(){
        console.log("updated");
      }).catch(function(error){
        console.log("error");
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }  
  }).catch(function(error){
    console.log("error");
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemName1 = new Item (
    {
      name: itemName
    }
  );
  if(listName==="Today"){
    itemName1.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(function(list){
      list.items.push(itemName1);
      list.save();
      res.redirect("/"+listName);
    })
  }
 

});
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.deleteOne({_id: checkedItemId}).then(function(){
      console.log("deleted");
      res.redirect("/");
    }).catch(function(error){
      console.log("error");
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then(function(list){
      res.redirect("/"+listName);
    }).catch(function(error){
      console.log(error);
    });
  }
 

});

app.get("/:topic",function(req,res){
  const customListName = _.capitalize(req.params.topic);
 
 
  List.findOne({name: customListName}).then(function(item){
    if(!item){
      
      const list = new List(
        {
          name: customListName,
          items: defaultItems
        }
      )
      list.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list",{listTitle: item.name, newListItems: item.items})
    }
  }).catch(function(error){
    console.log("error");
  });
})
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
