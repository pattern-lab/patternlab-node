'use strict';

exports['test nodeunit'] = {
	'hello world' : function(test){
		test.equals(1,1);
		test.done();
	}
};