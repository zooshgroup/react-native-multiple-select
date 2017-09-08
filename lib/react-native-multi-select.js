import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ListView,
  Modal,
} from 'react-native';
import { reject, find } from 'underscore';

import styles, { colorPack } from './styles';

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

  renderSelected = item => (
    <View
      style={[
        styles.selectedItem, {
          width: item.name.length * 8 + 60,
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
        {item.name}
      </Text>
      <TouchableOpacity
        onPress={() => {
          this._removeItem(item);
        }}
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
      </TouchableOpacity>
    </View>
  );

  _displaySelectedItems = () => {
    const selectedItems = [...this.state.selectedItems];
    const renderSelected = this.props.renderSelected ? (item => this.props.renderSelected(item, this._removeItem)) : this.renderSelected;
    return selectedItems.map(renderSelected);
  };

  _removeItem = (item) => {
    const selectedItems = [...this.state.selectedItems];
    const newItems = reject(selectedItems, singleItem => (item[this.props.uniqueKey] === singleItem[this.props.uniqueKey]));
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
    this.setState({ searchTerm: '' },() => this.props.selectedItemsChange([...this.state.selectedItems]));
  };

  _itemSelected = item => (!!find(this.state.selectedItems, singleItem => (item[this.props.uniqueKey] === singleItem[this.props.uniqueKey])));

  _toggleItem = (item) => {
    const selectedItems = [...this.state.selectedItems];
    const status = this._itemSelected(item);
    let newItems = [];
    if (status) {
      newItems = reject(selectedItems, singleItem => (item[this.props.uniqueKey] === singleItem[this.props.uniqueKey]));
    } else {
      selectedItems.push(item);
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
    ? <TouchableOpacity
      onPress={() => this._toggleItem(item)}
      style={{
        paddingLeft: 20,
        paddingRight: 20,
      }}
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
            {item.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
    : null);

  _filterItems = (searchTerm) => {
    const items = [...this.state.items];
    const filteredItems = [];
    items.forEach((item) => {
      const parts = searchTerm
        .trim()
        .split(/[ \-:]+/);
      const regex = new RegExp(`(${parts.join('|')})`, 'ig');
      if (regex.test(item.name)) {
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

  handleSubmitEditing = (event) => {
    if (!this.getItems().length) {
      const newItem = {
        id: Math
          .random()
          .toString(36)
          .substr(2, 9),
        name: event.nativeEvent.text,
        new: true,
      };
      const selectedItems = this
        .state
        .selectedItems
        .concat(newItem);
      this.setState({ selectedItems, searchTerm: '', selector: false }, () => this.props.selectedItemsChange(this.state.selectedItems));
    }
  };

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
      component = (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              flex: 1,
              marginTop: 20,
              textAlign: 'center',
              fontFamily: this.props.fontFamily,
              color: colorPack.danger,
            }}
          >
            Press enter to create new team.
          </Text>
        </View>
      );
    }
    return component;
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
          style={{
            backgroundColor: 'red',
          }}
          onRequestClose={() => {}}
        >
          <View style={styles.selectorView}>
            <View
              style={{
                paddingLeft: 16,
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
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
              onPress={this._toggleSelector}
            >
              {this._displaySelectedItems()}
            </TouchableOpacity>
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
