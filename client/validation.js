validateForm = function() {
	var msg = getValidationMessage();
	if (msg) {
		Flash.danger("__default__", msg);
		return false;
	}
	return true;
};

validateModal = function() {
	if (getValidationMessage()) {
		return false;
	}
	return true;
};

getValidationMessage = function() {
	var msg = '';
	$('.required').each(function() {
		if (!this.value) {
			$(this).parent().addClass('has-error');
			var fieldName = $(this).attr('name');
			if (fieldName) {
				msg += fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + " is required. ";
			}
		} else {
			$(this).parent().removeClass('has-error');
		}
	});
	
	$('.money').each(function() {
		if (this.value) {
			var money = parseFloat(this.value.replace('$', ''));
			if (money) {
				$(this).parent().removeClass('has-error');
				$(this).val(money.toFixed(2));
			} else {
				$(this).parent().addClass('has-error');
				var fieldName = $(this).attr('name');
				if (fieldName) {
					msg += fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + " must be a valid price. ";
				}
			}
		} else {
			$(this).parent().removeClass('has-error');
		}
	});
	
	return msg;
};