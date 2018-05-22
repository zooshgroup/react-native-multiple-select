import React from 'react';
import { View, TextInput, Text, TouchableHighlight, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    wrapperView: {
        marginTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: "center",
      },
    text: { color: 'gray' },
    searchBar: { height: 42, flex: 1, marginLeft: 8 },
});

class SearchField extends React.Component {
  render() {
    return (
        <View
          style={styles.wrapperView}
        >
        <TouchableHighlight onPress={this.props.onBackPress} underlayColor={null}>
            <Text style={styles.text}>Back</Text>
        </TouchableHighlight>
          <TextInput
            onChangeText={this.props.onChangeText}
            value={this.props.value}
            placeholder={this.props.placeholder}
            placeholderTextColor={this.props.placeholderTextColor}
            onSubmitEditing={this.props.onSubmitEditing}
            autoFocus
            style={styles.searchBar}
          />
        </View>
    );
  }
}

export default SearchField;
