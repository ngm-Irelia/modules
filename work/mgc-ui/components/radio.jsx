import React, { Component } from 'react';

class MyRadio extends Component {
	constructor (props) {
		super(props);
    this.handClickTrue = this.handClickTrue.bind(this);
    this.state = {
        defaultTure:1
    };
  }
  handClickTrue(e){
      this.setState({
        defaultTure:e.target.id
      })
  }
	render(){
    const number = this.props.number;
    const button = number.map((number,i) => {
      const className = this.state.defaultTure == number ? this.props.class + "icon-dot-circle" : this.props.class + "icon-hollow-circle";
      return <div key={number.toString()} className={className} data-value={this.props.value[i]} id={number} onClick={this.handClickTrue}>{this.props.text[i]}</div>;
    });
		return (
	      <div className="radiocomponent">
          {button}
	      </div>
	    );
	}
}

export default MyRadio;
export { MyRadio }