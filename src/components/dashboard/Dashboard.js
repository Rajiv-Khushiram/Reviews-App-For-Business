import React, {Component} from 'react';
import { connect } from 'react-redux';
import { getAccount } from '../../actions/accountActions';
import { getBusiness } from "../../actions/businessActions";
import { Layout, Carousel } from 'antd';

const { Content  } = Layout;
class Dashboard extends Component {

    componentDidMount() {
        Promise.all([
            this.props.getAccount()
        ]).then(() => {
            this.props.getBusiness()
        });
    }

    render() {
        return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{textAlign:'center'}}>
                <Carousel autoplay>
                    <div>
                        <img src = {require('../../images/1.PNG')} alt="" /> 
                    </div>
                    <div>
                        <img src = {require('../../images/2.PNG')} alt="" /> 
                    </div>
                    <div>
                        <img src = {require('../../images/3.PNG')} alt="" /> 
                    </div>
                    <div>
                        <img src = {require('../../images/4.PNG')} alt="" /> 
                    </div>
                </Carousel>
                <div id='background' style = {{width : '80%'}}>
                    <img src = {require('../../images/background.PNG')}  alt="" /> 
                </div>
                {/* <Button style = {{marginTop:'5rem'}}>GET STARTED</Button> */}
            </Content>
            {/* <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer> */}
        </Layout>
        );
    }
}

const mapStateToProps = (state) => {
    return{       
        auth:state.firebase.auth
    }
}

const mapDispatchToProps = dispatch => {
    return {
      getBusiness: () => dispatch(getBusiness()),
      getAccount: () => dispatch(getAccount()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);