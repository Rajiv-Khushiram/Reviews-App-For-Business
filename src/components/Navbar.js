import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Menu, Button, Icon } from 'antd';
import { Link } from 'react-router-dom';
import SignedInLinks from './layout/SignedInLinks';

const SubMenu = Menu.SubMenu;
class Navbar extends Component {
  state = {
    collapsed: false,
  };

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const { auth, profile, business, account } = this.props;
    const links = auth.uid ? <SignedInLinks profile={profile}/>: null;
    const businessName = business.name || '';
    const accountName = account.name || '';
    const accountInfo = auth.uid ? `${businessName} ${accountName}` : null;

    return (
      <Menu
        onClick={this.handleClick}
        theme = "dark"
        mode="horizontal"
        className = 'navbar'
      >
        <SubMenu 
          title={ 
            auth.uid ?
            <span>
              <Button type="primary" onClick={this.toggleCollapsed} >
                <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
              </Button>
            </span> : null
          }
          style={{float: 'left'}}
        >
          <Menu.Item key="1">
            <Link to = '/'>
              <Icon type="dashboard" />
              <span>Dashboard</span>
            </Link>
          </Menu.Item>           
          <Menu.Item key="2">
            <Link to = '/review-form'>
              <Icon type="form" />
              <span>Review Form</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to = '/customer-page'>
              <Icon type="message" />
              <span>SMS Campaign</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="4">
            <Link to = '/widget-page'>
              <Icon type="picture" />
              <span>Photo Feed</span>
            </Link>
          </Menu.Item>  
        </SubMenu>     
        <Menu.Item key="login" style={{float: 'right'}}> { links } </Menu.Item>
        <Menu.Item key="account" style={{float: 'right'}}> { accountInfo } </Menu.Item>
      </Menu>
    )
  }
}

const mapStateToProps = (state) => {
    return{
        account:state.account,
        auth:state.firebase.auth,
        business: state.business,
        profile:state.firebase.profile
    }
}
export default connect(mapStateToProps)(Navbar);