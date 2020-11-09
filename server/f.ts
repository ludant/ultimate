'use strict';

exports.take = function(arr, item) {
		arr.splice(arr.indexOf(item), 1);
		return arr;
	};
}
