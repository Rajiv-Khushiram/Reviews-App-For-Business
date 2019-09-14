import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu, Layout, Button, Icon } from "antd";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { signOut } from "../actions/authActions";
const { Header } = Layout;

const SubMenu = Menu.SubMenu;

const User = styled.div`
  padding: 0 12px;
`;
class Navbar extends Component {
  state = {
    collapsed: false
  };

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    const { auth, business } = this.props;
    const businessName = business.name || "";
    const accountInfo = auth.uid ? `${businessName}` : "";
    const signedInNavItems = [
      {
        label: "New Review",
        link: "/new-review"
      },
      {
        label: "Account Settings",
        link: "/settings"
      },
      {
        label: "Sign Out",
        link: "/signin",
        onClick: this.props.signOut
      }
    ];
    const signedOutNavItems = [
      {
        label: "Sign In",
        link: "/signin"
      }
    ];
    const links = auth.uid ? signedInNavItems : signedOutNavItems;

    return (
      <Header style={{ height: "50px", padding: "0" }}>
        <Menu
          onClick={this.handleClick}
          theme="dark"
          mode="horizontal"
          className="navbar"
        >
          <SubMenu
            title={
              auth.uid ? (
                <span>
                  <Button type="primary" onClick={this.toggleCollapsed}>
                    <Icon type="menu" style={{ marginRight: "0" }} />
                  </Button>
                </span>
              ) : null
            }
            style={{ float: "left" }}
          >
            {links.map((item, index) => {
              return (
                <Menu.Item key={item.link}>
                  <Link to={item.link} onClick={item.onClick}>
                    {item.label}
                  </Link>
                </Menu.Item>
              );
            })}
          </SubMenu>
          <div>
            <User>
              <Icon type="user" color="fff" /> {accountInfo}
            </User>
          </div>
        </Menu>
      </Header>
    );
  }
}

const mapStateToProps = state => {
  return {
    account: state.account,
    auth: state.firebase.auth,
    business: state.business,
    profile: state.firebase.profile
  };
};

const mapDispatchToProps = dispatch => {
  return {
    signOut: () => dispatch(signOut())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navbar);
