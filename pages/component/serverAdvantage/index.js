Component({
  properties: {
    advantageList: {
      type: Array
    },
    priceContent: {
      type: Object
    }

  },
  data: {
    showMore: false
  },
  methods: {
    
    __showMore: function () {
      const {showMore} = this.data;
      this.setData({
        showMore: !showMore
      });
      console.log('价格页展示', showMore);
    }
  }
});
