var express = require('express');
var router = express.Router();
var config = require('./../config');
var Util = require('./../util/util');
var Factory = require('./../factory/factory');

router.get('/:id', Util.authenticate ,function(req,res,next){
  let result = Factory.getInstance().getController("user").findById(req.params.id);
  result.then((data)=>{
    res.status(200).send({error:false, 'data' : data});
  },(error)=>{
    res.status(400).send({error:true, 'data' : error.message});
  });
});

router.delete('/:id',Util.authenticate,function(req,res,next){
  let result = Factory.getInstance().getController("user").remove(req.params.id);
  result.then((data)=>{
    res.status(200).send({error:false, 'data' : data});
  },(error)=>{
    res.status(400).send({error:true, 'data' : error.message});
  });
});

router.put('/',Util.authenticate,function(req,res,next){
  let userU = req.body;
  let result = Factory.getInstance().getController("user").findById(userU.id);
  result.then(function (data) {
    if(userU.password != data.password){
      userU.password = crypto.createHash('sha256').update(userU.password).digest('base64');
    }
    let result = Factory.getInstance().getController("user").update(userU);
    result.then((data)=>{
      res.status(200).send({error:false, 'data' : data});
    },(error)=>{
      res.status(400).send({error:true, 'data' : error.message});
    });
  });
});

module.exports = router;
