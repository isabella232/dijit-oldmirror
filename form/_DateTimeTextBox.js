dojo.provide("dijit.form._DateTimeTextBox");

dojo.require("dojo.date");
dojo.require("dojo.date.locale");
dojo.require("dojo.date.stamp");
dojo.require("dijit.form.ValidationTextBox");

dojo.declare(
	"dijit.form._DateTimeTextBox",
	dijit.form.RangeBoundTextBox,
	{
		// summary:
		//		A validating, serializable, range-bound date or time text box.

		// constraints object: min, max
		regExpGen: dojo.date.locale.regexp,
		compare: dojo.date.compare,
		format: function(/*Date*/ value, /*Object*/ constraints){
			if(!value || value.toString() == this._invalid){ return ''; }
			return dojo.date.locale.format(value, constraints);
		},
		parse: function(/*String*/ value, /*Object*/ constraints){
			return dojo.date.locale.parse(value, constraints) || undefined; /* can't return null to getValue since that's special */
		},

		serialize: dojo.date.stamp.toISOString,

		value: new Date(""),	// NaN
		_invalid: (new Date("")).toString(),	// NaN

		// popupClass: String
		//              Name of the popup widget class used to select a date/time
		popupClass: "", // default is no popup = text only
		_selector: "",

		postMixInProperties: function(){
			//dijit.form.RangeBoundTextBox.prototype.postMixInProperties.apply(this, arguments);
			this.inherited("postMixInProperties",arguments);
			var constraints = this.constraints;
			constraints.selector = this._selector;
			if(typeof constraints.min == "string"){ constraints.min = dojo.date.stamp.fromISOString(constraints.min); }
 			if(typeof constraints.max == "string"){ constraints.max = dojo.date.stamp.fromISOString(constraints.max); }
		},

		_onFocus: function(/*Event*/ evt){
			// summary: open the TimePicker popup
			this._open();
		},

		setValue: function(/*Date*/ value, /*Boolean, optional*/ priorityChange){
			// summary:
			//	Sets the date on this textbox
			this.inherited('setValue', arguments);
			if(this._picker){
				// #3948: fix blank date on popup only
				if(!value || value.toString() == this._invalid){value=new Date();}
				this._picker.setValue(value);
			}
		},

		_open: function(){
			// summary:
			//	opens the TimePicker, and sets the onValueSelected value

			if(this.disabled || this.readOnly || !this.popupClass){return;}

			var self = this;

			if(!this._picker){
				var popupProto=dojo.getObject(this.popupClass, false);
				this._picker = new popupProto({
					onValueSelected: function(value){

						self.focus(); // focus the textbox before the popup closes to avoid reopening the popup
						setTimeout(dojo.hitch(self, "_close"), 1); // allow focus time to take

						// this will cause InlineEditBox and other handlers to do stuff so make sure it's last
						dijit.form._DateTimeTextBox.superclass.setValue.call(self, value, true);
					},
					lang: this.lang,
					constraints:this.constraints,
					isDisabledDate: function(/*Date*/ date){
						// summary:
						// 	disables dates outside of the min/max of the _DateTimeTextBox
						return self.constraints && (dojo.date.compare(self.constraints.min,date) > 0 || dojo.date.compare(self.constraints.max,date) < 0);
					}
				});
				this._picker.setValue(this.getValue() || new Date());
			}
			if(!this._opened){
				dijit.popup.open({
					parent: this,
					popup: this._picker,
					around: this.domNode,
					onCancel: dojo.hitch(this, this._close),
					onClose: function(){ self._opened=false; }
				});
				this._opened=true;
			}
			
			dojo.marginBox(this._picker.domNode,{ w:this.domNode.offsetWidth });
		},

		_close: function(){
			if(this._opened){
				dijit.popup.close(this._picker);
				this._opened=false;
			}			
		},

		_onBlur: function(){
			// summary: called magically when focus has shifted away from this widget and it's dropdown
			this._close();
			this.inherited('_onBlur', arguments);
			// don't focus on <input>.  the user has explicitly focused on something else.
		},

		getDisplayedValue:function(){
			return this.textbox.value;
		},

		setDisplayedValue:function(/*String*/ value){
			this.textbox.value=value;
		}
	}
);
