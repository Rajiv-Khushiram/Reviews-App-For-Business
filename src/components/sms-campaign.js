import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Form, Button, Input, Table} from 'antd';
import { search } from '../actions/searchActions';
import { getAccount } from "../actions/accountActions";
import { getBusiness } from "../actions/businessActions";

const TextArea = Input.TextArea;
const Search = Input.Search;
const columns = [
    {
        title: 'Customer',
        dataIndex: 'last_name',
    },
    {
        title: 'Customer',
        dataIndex: 'first_name',
    },
    {
        title: 'Phone Number',
        dataIndex: 'phone',
    },
];

// rowSelection object indicates the need for row selection
const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: record => ({
    //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
};

class SMSCAMPAIGNPAGE extends Component {
    state = {
        phoneNumber:'',
        customerList:[],
        customers:[],
        text:'',
        sent:false
    }
   
    componentDidMount() {
        Promise.all([
          this.props.getAccount()
        ]).then(() => {
          this.props.getBusiness();
        })
    }

    onSubmit = event => {
        event.preventDefault();
    }

    handleSearch = (value) => {
        this.props.search(value);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]:e.target.value
        }) 
    }         

    onClick(e) {
        // console.log(e);       
    }

    render(){
        const { customerList } = this.props;

        return(
            <div className = "customer-container">
                <Form onSubmit={this.onSubmit} >
                    <Form.Item>
                        <Search
                            id = 'phoneNumber'
                            placeholder="input search text"
                            enterButton
                            onChange={this.handleChange}
                            onSearch={value => this.handleSearch(value)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>             
                        <Table rowSelection={rowSelection} columns={columns} dataSource={customerList}  rowKey={"objectID"} />
                    <Form.Item>
                        <TextArea 
                            id = 'text' 
                            rows={5}
                            onChange = {this.handleChange} 
                            style={{ width: '100%' }} 
                            placeholder = 'Text'
                        />   
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                    >
                        {
                            (this.state.sent && 'Text has been sent!') || (!this.state.sent && 'Send Text')
                        }
                    </Button> 
                </Form>          
            </div> 
        );
    }
}

const mapStateProps = (state) => {    
    return {
        customerList : state.search.customerList
    }
}

const mapDispatchToProps = (dispatch) => {
    return{
        search: (phone) => dispatch(search(phone)),
        getBusiness: () => dispatch(getBusiness()),
        getAccount: () => dispatch(getAccount()),
    }
}

export default Form.create() (connect(mapStateProps, mapDispatchToProps)(SMSCAMPAIGNPAGE));