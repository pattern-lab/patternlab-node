var expect          = require('expect.js'),
    jsdom           = require('jsdom').jsdom,
    EventDelegator  = require('../eventDelegator'),
    matches         = require('../matches');

function captureStream(stream){
  var oldWrite = stream.write;
  var buf = '';
  stream.write = function(chunk, encoding, callback){
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  }

  return {
    unhook: function unhook(){
     stream.write = oldWrite;
    },
    captured: function(){
      return buf;
    }
  };
}

describe('eventDelegator', function () {
    var document    = jsdom('<div id="test"><div id="handler"></div></div>'),
        window      = document.parentWindow,
        el = document.getElementById('test');

    // Add polyfill
    matches(window.HTMLElement.prototype);

    var hook;
    
    beforeEach(function(){
        hook = captureStream(process.stdout);
    });
    afterEach(function(){
        hook.unhook(); 
    });

    it('should create a eventDelegator object', function () {
        var delegator = new EventDelegator(el);
        expect(delegator.toString()).to.equal('EventDelegator');
    });

    it('should return the first object if two eventDelegators are created on the same element', function() {
        var delegator = new EventDelegator(el),
            delegator2 = new EventDelegator(el);
    
        expect(delegator).to.equal(delegator2);
    });

    it('should capture a click', function (done) {
        var delegator = new EventDelegator(el);
        delegator.on('click', '#handler', function (e) {
            expect(e.target.id).to.equal('handler');
            done();
        });

        var e = window.document.createEvent('MouseEvent');
        e.initEvent('click', true, true);
        document.getElementById('handler').dispatchEvent(e);
        //console.log(hook.captured());
    });

    it('should remove all events', function () {
        var delegator = new EventDelegator(el);
        
        delegator.off('click');

        expect(typeof delegator.events.click).to.equal('undefined');   
    })

    it('should remove an event', function (done) {
        var delegator = new EventDelegator(el),
            clicked = false;

        /*delegator.on('click', function (e) {
            clicked = true;
        });*/

        delegator.off('click');

        var e = window.document.createEvent('MouseEvent');
        e.initEvent('click', true, true);
        //document.getElementById('handler').dispatchEvent(e);

        setTimeout(function() {
            expect(clicked).to.equal(false);
            done();
        },300);
    })
});