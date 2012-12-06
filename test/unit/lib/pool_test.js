var assert    = require('assert')
  , pool      = require('../../../lib/pool')
  , chassis   = require('../../../index')
  , redis     = require('redis');

describe("Pool", function(){

  describe("#addSocket", function(){

    after(function(done){
      pool.removeSocket('uniqueId', function(err){
        assert.equal(null, err);
        done();
      })
    });

    it("should add the socket to the pool of sockets", function(done){
      pool.getSockets(function(err,sockets){
        assert.equal(null, err);
        assert.equal(undefined,sockets['uniqueId']);
        var mockSocket = {id: 'uniqueId'};
        pool.addSocket(mockSocket, function(err){
          assert.equal(null, err);
          pool.getSockets(function(err,sockets){
            assert.equal(mockSocket, sockets['uniqueId']);
            done();
          });
        });
      });      
    });

  });

  describe("#removeSocket", function(){

    it("should remove the socket from the pool of sockets", function(done){
      var mockSocket = {id:'anotherUniqueId'};
      pool.addSocket(mockSocket, function(err){
        pool.removeSocket('anotherUniqueId', function(err){
          assert.equal(null,err);
          pool.getSockets(function(err, sockets){
            assert.equal(undefined, sockets['anotherUniqueId']);
            done();
          });
        });
      });
    });

    // Note - this is more of a functional test
    it("should remove the socket from all of the channels that it is subscribed to", function(done){
      var mockSocket  = {id: '90ej1j90e1'}
        , channelName = "presentation_xxxx"
        , data        = {name:"paul"};
      pool.addSocket(mockSocket, function(err){
        chassis.pubsub.subscribe(channelName, mockSocket.id, function(err){
          pool.removeSocket(mockSocket.id, function(err){
            var redisClient = redis.createClient();
            redisClient.smembers('chassis_'+channelName, function(err, members){
              assert.deepEqual([],members);
              done();
            });
          });
        });
      });
    });

  });

  describe("#getSockets", function(){

    it("should return the entire pool of sockets", function(done){
      var mockSocketOne = {id:'tango'};
      var mockSocketTwo = {id:'cash'};
      pool.addSocket(mockSocketOne, function(err){
        pool.addSocket(mockSocketTwo, function(err){
          pool.getSockets(function(err,sockets){
            assert.equal(sockets['tango'], mockSocketOne);
            assert.equal(sockets['cash'], mockSocketTwo);
            assert.deepEqual(sockets,{'tango':mockSocketOne, 'cash':mockSocketTwo});
            done();
          });
        });
      });
    });

  });
  
});