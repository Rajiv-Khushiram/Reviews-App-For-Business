import React, { Component } from "react";
import { connect } from "react-redux";
import { Layout, Menu, Icon } from "antd";

import { getAccount } from "../actions/accountActions";
import { getBusiness } from "../actions/businessActions";

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

export class Settings extends Component {
  componentDidMount() {
    Promise.all([this.props.getAccount()]).then(() => {
      this.props.getBusiness()
    });
  }
  render() {
    const { account, business } = this.props;
    return (
      <Layout style={{ minHeight: "calc(100vh - 40px)" }}>
        <Content style={{ padding: "50px" }}>
          {/* <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb> */}
          <Layout style={{ padding: "24px 0", background: "#fff" }}>
            <Sider width={200} style={{ background: "#fff" }}>
              <Menu
                mode="inline"
                defaultSelectedKeys={["1"]}
                defaultOpenKeys={["sub1"]}
                style={{ height: "100%" }}
              >
                <SubMenu
                  key="sub1"
                  title={
                    <span>
                      <Icon type="user" />
                      Account
                    </span>
                  }
                >
                  <Menu.Item key="1">Password</Menu.Item>
                </SubMenu>
                <SubMenu
                  key="sub3"
                  title={
                    <span>
                      <Icon type="notification" />
                      Messages
                    </span>
                  }
                >
                  <Menu.Item key="9">Review Requests</Menu.Item>
                </SubMenu>
              </Menu>
            </Sider>
            <Content style={{ padding: "0 24px", minHeight: 280 }}>
              <h1>Debug</h1>
              <h3>Account</h3>
              <table cellpadding="10">
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>
                      <strong>{account.name}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>
                      <strong>{account.email}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Products</td>
                    <td>
                      <pre></pre>
                    </td>
                  </tr>
                </tbody>
              </table>
              <hr/>
              <h3>Business</h3>
              <table cellpadding="10">
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>
                      <strong>{business.name}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Review Link</td>
                    <td>
                      <strong><a href={business.review_url} target="_blank" rel="noopener noreferrer">{business.review_url}</a></strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Products</td>
                    <td>
                      <pre>{JSON.stringify(business.products)}</pre>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Content>
          </Layout>
        </Content>
      </Layout>
    );
  }
}

const mapStateToProps = state => ({
  business: state.business,
  account: state.account
});

const mapDispatchToProps = (dispatch) => {
  return {
    getBusiness: () => dispatch(getBusiness()),
    getAccount: () => dispatch(getAccount()),
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
