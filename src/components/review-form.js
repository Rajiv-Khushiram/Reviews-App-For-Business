import React, { Component } from "react";
import { Form, Input, Select, Button, Modal} from 'antd';
// import FormItem from "antd/lib/form/FormItem";
import { connect } from "react-redux";

import { sendReview, openCamera, closeCamera, retryPhoto, removePhoto } from "../actions/reviewActions";
import { getAccount } from "../actions/accountActions";
import { getBusiness } from "../actions/businessActions";
import {productMake, productModel, productYear} from '../constants/productInfo';
import Camera, { FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import './modal.css';

const { Option } = Select;
const TextArea = Input.TextArea;

class CustomerReview extends Component {
  state = {
    first_name: "",
    last_name: "",
    phone: "",
    pictureUri: null,
    visible: false,
    uid: this.props.auth.uid,
    product_year: productYear[0],
    product_make: productMake[0],
    model_list: productModel[productMake[0]],
    product_model: productModel[productMake[0]][0],
    comments:"",
    loading: false,
    submitted:false,
  };

  async componentDidMount() {
     await this.props.getAccount()
     await this.props.getBusiness();
  }

  showCamera = () => {
    this.props.openCamera(this.state);
  };

  removePic = () => {
    this.props.removePhoto(this.state)
  }

  clearPictureUrl = () => { 
    this.props.retryPhoto(this.state);
  }
  handleOk = () => {
    this.props.closeCamera(this.state)
  };

  handleCancel = () => {
    this.props.closeCamera(this.state)
  };
   // Do stuff with the dataUri photo...
  handleYearChange = (value) => {
    this.setState({ product_year: value });
  }
   // console.log();
  handleProductMakeChange = (value) => {
    this.setState({
      product_make: value,
      model_list: productModel[value],
      product_model: productModel[value][0],
    });
  }

  onCameraError (error) {
    console.error('onCameraError', error);
  }

  onCameraStart (stream) {
    console.log('onCameraStart');
  }

  onCameraStop () {
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
    
  };

  clearPictureUrl = () => { 
    this.setState({
      pictureUri: false,
    });
  }

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleModelChange = (value) => {
    this.setState({
      product_model: value,
    });
  };
  
  checkPhoneValidation = (rule, value, callback) => {
    const re= /^04\d{8}$/; 
    if (value && !re.test(value)) {
      callback('Input a valid phone number');
    } else {
      callback();
    }
  }

  handleYearChange = (value) => {
    this.setState({ product_year: value });
  }

  handleProductMakeChange = (value) => {
    this.setState({
      product_make: value,
      model_list: productModel[value],
      product_model: productModel[value][0],
    });
  }

  handleModelChange = (value) => {
    this.setState({
      product_model: value,
    });
  };

  openNotification() {
    alert('Form has been successfully submitted')
    // notification.open({
    //   message: 'Notification Title',
    //   description: 'Form has been successfully submitted',
    //   icon: <Icon type="check-circle" style={{ color: 'green' }} />,
    // });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.setState({ loading: true });
        e.target.reset();
         this.props.sendReview(this.state);
        setTimeout(() => {
          if (this.props.review.submitted && !this.props.review.error){
            this.openNotification();
          };
          this.setState({ loading: false });
        }, 2000)
      }
    });
  };

  checkPhoneValidation = (rule, value, callback) => {
    const re= /^04\d{8}$/; 
    if (value && !re.test(value)) {
      callback('Input a valid phone number');
    } else {
      callback();
    }
  }

  render() {
   /*const picture = this.state.pictureUri ? (
     <div>
       <img alt="img" src={this.state.pictureUri} />
     </div>
   ) : null;*/
    const { getFieldDecorator } = this.props.form;
    const { model_list } = this.state;
    return (
      <div className = 'review-container'>
        <div>
          <Modal
            title="Basic Modal"
            width= '520'
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[ ]}
          >
            {!this.state.pictureUri && this.state.visible &&
              <Camera
                onTakePhoto = { (dataUri) => { this.onTakePhoto(dataUri); } }
                onCameraError = { (error) => { this.onCameraError(error); } }
                idealFacingMode = {FACING_MODES.ENVIRONMENT}
                idealResolution = {{width: 640, height: 480}}
                imageCompression = {0.97}
                isMaxResolution = {false}
                isImageMirror = {false}
                isSilentMode = {true}
                isDisplayStartCameraError = {true}
                isFullscreen = {false}
                sizeFactor = {1}
                onCameraStart = { (stream) => { this.onCameraStart(stream); } }
                onCameraStop = { () => { this.onCameraStop(); } }
              />
            }
            {this.state.pictureUri && this.state.visible &&
              <div>
              <center><img alt="img" src={this.state.pictureUri} /></center>
              <br></br>
              <center><Button type="primary" onClick={this.clearPictureUrl} 
              icon="camera">
              Retry
            </Button>
            <Button type="primary" onClick={this.handleOk} 
              icon="arrow-right">
              Continue
            </Button></center>
            </div>
            }
        </Modal>
      </div>
      <div className = 'review-container'>
        <Form 
        // {...formItemLayout} 
          onSubmit={this.handleSubmit.bind(this)} style = {{margin: '100px auto'}}>
          <Form.Item >Customers Details</Form.Item >
          <center>
            <Button type="primary" onClick={this.showModal} icon="camera" size="large">
              Take a Photo
            </Button>
          </center>
          <br></br>
          {this.state.pictureUri &&
          <center><img alt="img" src={this.state.pictureUri} /></center>}
          <Form.Item >
            {getFieldDecorator('first_name', {
              rules: [{ required: true, message: 'Input your first name!', whitespace: true }],
            })(
              <Input type="text" onChange={this.handleChange} style={{ width: '100%' }} placeholder = "First Name" />
            )}
          </Form.Item>
          <Form.Item >
            {getFieldDecorator('last_name', {
              rules: [{ required: true, message: 'Input your last name!', whitespace: true }],
            })(
              <Input type="text" onChange={this.handleChange} style={{ width: '100%' }} placeholder = "Last Name" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('phone', {
              rules: [{ required: true, message: 'Please input your phone number!'}, {
                validator: this.checkPhoneValidation
              }],
            })(
                <Input type="text" id="phone" onChange={this.handleChange} style={{ width: '100%' }} placeholder = "Phone Number" />
            )}
          </Form.Item>
          <Form.Item>
          </Form.Item>
          <Form.Item >Purchase Details</Form.Item >
          <Form.Item>
            <Select 
              defaultValue = {productYear[0]} 
              style={{ width: '100%' }}
              value={this.state.product_year}
              onChange = {this.handleYearChange}
            >
              {productYear.map(year => (
                <Option key = {year}>{year}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Select
              defaultValue={productMake[0]}
              style={{ width: '100%' }}
              value={this.state.product_make}
              onChange={this.handleProductMakeChange}
            >
              {productMake.map(make => (
                <Option key={make}>{make}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Select
              style={{ width: '100%' }}
              value={this.state.product_model}
              onChange={this.handleModelChange}
            >
              {model_list.map(model => (
                <Option key={model}>{model}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <TextArea 
              id = 'comments' 
              rows={5}
              onChange = {this.handleChange} 
              style={{ width: '100%' }} 
              placeholder = 'Comments'
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={this.state.loading}>Submit</Button>
          </Form.Item>        
          {this.props.review.submitted && !this.props.review.error && <div>Success</div>}
          {this.props.review.submitted && this.props.review.error && <div>Error</div> }
        </Form>
      </div>
    </div>
    )
  }
}

const mapStateToProps = (state) => {
   return {
       auth: state.firebase.auth,
       review: state.review
   }
}

const mapDispatchToProps = dispatch => {
 return {
   sendReview: review => dispatch(sendReview(review)),
   getBusiness: () => dispatch(getBusiness()),
   getAccount: () => dispatch(getAccount()),
   openCamera: () => dispatch(openCamera()),
   closeCamera: () => dispatch(closeCamera()),
   retryPhoto: () => dispatch(retryPhoto()),
   removePhoto: () => dispatch(removePhoto()),
   dispatch
 }
}

export default Form.create()(connect(mapStateToProps, mapDispatchToProps) (CustomerReview));

