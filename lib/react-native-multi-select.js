import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableWithoutFeedback,
    TouchableHighlight,
    ListView,
    Modal,
    Image,
} from 'react-native';
import { reject, find } from 'underscore';
import { path } from 'ramda';
import PropTypes from 'prop-types'

import styles, { colorPack } from './styles';
import AddImage from './img/ic_add_circle.png';

export default class MultiSelect extends Component {
  static propTypes = {
    selectedItems: PropTypes.array,
    items: PropTypes.array.isRequired,
    uniqueKey: PropTypes.string,
    tagBorderColor: PropTypes.string,
    tagTextColor: PropTypes.string,
    fontFamily: PropTypes.string,
    tagRemoveIconColor: PropTypes.string,
    selectedItemsChange: PropTypes.func.isRequired,
    selectedItemFontFamily: PropTypes.string,
    selectedItemTextColor: PropTypes.string,
    itemFontFamily: PropTypes.string,
    itemTextColor: PropTypes.string,
    selectedItemIconColor: PropTypes.string,
    searchInputPlaceholderText: PropTypes.string,
    searchInputStyle: PropTypes.object,
    selectText: PropTypes.string,
    altFontFamily: PropTypes.string,
    submitButtonColor: PropTypes.string,
    submitButtonText: PropTypes.string,
    renderSelected: PropTypes.func,
    renderRow: PropTypes.func,
    newBackgroundColor: PropTypes.string,
    newTextColor: PropTypes.string,
    allowNewItemCreation: PropTypes.bool,
    noItemsFoundText: PropTypes.string,
    createNewText: PropTypes.string,
    renderCreateNewButton: PropTypes.func,
    namePath: PropTypes.array,
    touchableHighlightUnderlayColor: PropTypes.string,
    single: PropTypes.bool,
  };

  static defaultProps = {
    selectedItems: [],
    items: [],
    uniqueKey: '_id',
    tagBorderColor: colorPack.primary,
    tagTextColor: colorPack.primary,
    fontFamily: '',
    tagRemoveIconColor: colorPack.danger,
    selectedItemsChange: () => {},
    selectedItemFontFamily: '',
    selectedItemTextColor: colorPack.primary,
    itemFontFamily: '',
    itemTextColor: colorPack.textPrimary,
    selectedItemIconColor: colorPack.primary,
    searchInputPlaceholderText: 'Search',
    searchInputStyle: {
      color: colorPack.textPrimary,
    },
    selectText: 'Select',
    altFontFamily: '',
    submitButtonColor: '#CCC',
    submitButtonText: 'Submit',
    renderSelected: undefined,
    renderRow: undefined,
    newBackgroundColor: 'lightgrey',
    newTextColor: 'black',
    allowNewItemCreation: false,
    noItemsFoundText: 'No items found',
    createNewText: 'Create new',
    renderCreateNewButton: undefined,
    namePath: ['name'],
    touchableHighlightUnderlayColor: 'grey',
    single: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      selector: false,
      searchTerm: '',
      selectedItems: this.props.selectedItems.slice(),
      items: this.props.items,
      showInput: false,
    };
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.selectedItems) {
      this.setState({selectedItems: nextProps.selectedItems});
    }
  }

  renderSelected = item => (
    <View
      style={[
        styles.selectedItem, {
          width: path(this.props.namePath,item).length * 8 + 60,
          justifyContent: 'center',
          height: 40,
          borderColor: this.props.tagBorderColor,
        },
      ]}
      key={item[this.props.uniqueKey]}
    >
      <Text
        style={{
          flex: 1,
          color: this.props.tagTextColor,
          fontFamily: this.props.fontFamily,
          fontSize: 15,
        }}
      >
        {path(this.props.namePath,item)}
      </Text>
      <TouchableHighlight
        onPress={() => {
          this._removeItem(item);
        }}
        underlayColor={this.props.touchableHighlightUnderlayColor}
      >
        <Text
          name="cancel"
          style={{
            color: this.props.tagRemoveIconColor,
            fontSize: 22,
            marginLeft: 10,
          }}
        >
            X
        </Text>
      </TouchableHighlight>
    </View>
    );

  _displaySelectedItems = () => {
    const selectedItems = [...this.state.selectedItems];
    const renderSelected = this.props.renderSelected ? (item => this.props.renderSelected(item, this._removeItem)) : this.renderSelected;
    return selectedItems.map(renderSelected);
  };

  _removeItem = (item) => {
    const selectedItems = [...this.state.selectedItems];
    const newItems = reject(selectedItems, singleItem => (item && singleItem &&item[this.props.uniqueKey] === singleItem[this.props.uniqueKey]));
    this.setState({ selectedItems: newItems }, () => this.props.selectedItemsChange(newItems));
  };

  _removeAllItems = () => {
    this.setState({ selectedItems: [] }, () => this.props.selectedItemsChange([]));
  };

  _toggleSelector = () => {
    this.setState({
      selector: !this.state.selector,
    });
  };

  _submitSelection = () => {
    this._toggleSelector();
        // reset searchTerm
    this.setState({ searchTerm: '' }, () => this.props.selectedItemsChange([...this.state.selectedItems]));
  };

  _itemSelected = item => (!!find(this.state.selectedItems, singleItem => (item && singleItem &&item[this.props.uniqueKey] === singleItem[this.props.uniqueKey])));

  _toggleItem = (item) => {
    let selectedItems = [...this.state.selectedItems];
    const status = this._itemSelected(item);
    let newItems = [];
    if (status) {
      newItems = reject(selectedItems, singleItem => (item && singleItem &&item[this.props.uniqueKey] === singleItem[this.props.uniqueKey]));
    } else {
      if(this.props.single) {
        selectedItems = [ item ];
      }
      else{
        selectedItems.push(item);
      }
    }
    this.setState({
      selectedItems: status
          ? newItems
          : selectedItems,
    }, () => this._submitSelection());
  };

  _itemStyle = item => (this._itemSelected(item)
    ? {
      fontFamily: this.props.selectedItemFontFamily,
      color: this.props.selectedItemTextColor,
    }
    : {
      fontFamily: this.props.itemFontFamily,
      color: this.props.itemTextColor,
    });

  _getRow = item => (!this._itemSelected(item)
        ? <TouchableHighlight
          onPress={() => this._toggleItem(item)}
          style={{
            paddingLeft: 20,
            paddingRight: 20,
          }}
        underlayColor={this.props.touchableHighlightUnderlayColor}
        >
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  {
                    flex: 1,
                    fontSize: 16,
                    paddingTop: 5,
                    paddingBottom: 5,
                  },
                  this._itemStyle(item),
                ]}
              >
                {path(this.props.namePath,item)}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
        : null);

  _filterItems = (searchTerm) => {
    const items = [...this.state.items];
    const filteredItems = [];
    items.forEach((item) => {
      const parts = searchTerm
          .trim()
          .split(/[ \-:]+/);
      const regex = new RegExp(`(${parts.join('|')})`, 'ig');
      if (regex.test(path(this.props.namePath,item))) {
        filteredItems.push(item);
      }
    });
    return filteredItems;
  };

  getItems = () => {
    const searchTerm = this
        .state
        .searchTerm
        .trim();
    if (searchTerm) {
      return this._filterItems(searchTerm);
    }
    return this.state.items;
  };

  handleSubmitEditing = () => {
    if (!this.props.allowNewItemCreation) return;
    const newItem = {
      id: Math
          .random()
          .toString(36)
          .substr(2, 9),
      name: this.state.searchTerm,
      new: true,
    };
    const selectedItems = this
        .state
        .selectedItems
        .concat(newItem);
    this.setState({ selectedItems, searchTerm: '', selector: false }, () => this.props.selectedItemsChange(this.state.selectedItems));
  };

  _renderCreateNewButton = (onPress, searchTerm) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TouchableHighlight onPress={onPress} underlayColor={this.props.touchableHighlightUnderlayColor}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            backgroundColor: this.props.newBackgroundColor,
            borderRadius: 5000,
          }}
        >
          <Image source={AddImage} style={{ tintColor: this.props.newTextColor }} />
          <View style={{ flexDirection: 'column' }}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: this.props.fontFamily,
                color: this.props.newTextColor,
                fontSize: 10,
              }}
            >
              {this.props.createNewText}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: this.props.fontFamily,
                color: this.props.newTextColor,
                fontSize: 14,
              }}
            >
              {searchTerm}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    </View>)

  _renderItems = () => {
    const items = this.getItems();
    let component = null;

    if (items.length) {
      const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      });
      const dataSource = ds.cloneWithRows(items);
      const renderRow = this.props.renderRow ? item => this.props.renderRow(item, this._itemSelected(item), this._toggleItem) : this._getRow;
      component = (<ListView
        enableEmptySections
        dataSource={dataSource}
        renderRow={renderRow}
        keyboardShouldPersistTaps="handled"
      />);
    } else {
      component = (<Text
        style={{
          textAlign: 'center',
          fontFamily: this.props.fontFamily,
        }}
      >
        {this.props.noItemsFoundText}
      </Text>);
    }
    const renderButton = this.props.renderCreateNewButton || this._renderCreateNewButton;
    const createNewButton = this.props.allowNewItemCreation ? renderButton(this.handleSubmitEditing, this.state.searchTerm) : null;
    return (
      <View>
        {this.state.searchTerm ? createNewButton : null}
        {component}
      </View>
    );
  };

  render() {
    return (
      <View
        style={{
          flex: -1,
          flexDirection: 'column',
          marginBottom: 10,
        }}
      >
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.selector}
          onRequestClose={() => this.setState({ selector: false })}
        >
          <View style={styles.selectorView}>
            <View
              style={{
                paddingLeft: 16,
                paddingRight: 16,
                backgroundColor: colorPack.light,
              }}
            >
              <TextInput
                onChangeText={searchTerm => this.setState({ searchTerm })}
                value={this.state.searchTerm}
                placeholder={this.props.searchInputPlaceholderText}
                placeholderTextColor={colorPack.placeholderTextColor}
                style={this.props.searchInputStyle}
                onSubmitEditing={this.handleSubmitEditing}
                autoFocus
              />
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                backgroundColor: '#fafafa',
              }}
            >
              {this._renderItems()}
            </View>
          </View>
        </Modal>
        <TouchableWithoutFeedback onPress={() => this.setState({ selector: false })}>
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </TouchableWithoutFeedback>
        {this.state.selectedItems.length
            ? <View >
              <TouchableHighlight
                onPress={this._toggleSelector}
                underlayColor={this.props.touchableHighlightUnderlayColor}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                >
                  {this._displaySelectedItems()}
                </View>
              </TouchableHighlight>
            </View>
            : null}
        <View>
          {this.state.selectedItems.length === 0
            ? (
              <View style={styles.dropdownView}>
                <View
                  style={[
                    styles.subSection, {
                      paddingTop: 10,
                      paddingBottom: 10,
                    },
                  ]}
                >
                  <TouchableWithoutFeedback onPress={this._toggleSelector}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontFamily: this.props.altFontFamily
                              ? this.props.altFontFamily
                              : this.props.fontFamily,
                          fontSize: 16,
                          color: colorPack.placeholderTextColor,
                        }}
                      >
                        {this.props.selectText}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            )
            : null}
        </View>
      </View>
    );
  }
}
