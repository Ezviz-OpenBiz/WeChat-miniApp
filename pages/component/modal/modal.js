Component({
  properties: {
    show: {
      type: Boolean
    },
    type: {
      type: String
    },
    contentText: {
      type: String
    }

  },
  data: {
    
  },
  methods: {
    _handdleFun () {
      this.triggerEvent('handOk')
    },
    
    _cancelFun () {
      this.triggerEvent('handCancel')
    }
  }
});

