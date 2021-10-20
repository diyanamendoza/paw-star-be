function editedYelpData(body) {
  return body.map(entry => {
    const container = {};
    container['name'] = entry.name;
    container['category'] = entry.categories.filter(category => category.title === 'Parks' || 'Pet Groomers' || 'Pet Photography' || 'Pet Adoption');
    container['url'] = entry.url;
    container['distance'] = Math.round((((entry.distance) * 0.00062137)) * 100) / 100;
    return container;
  });
}

function editedRandomWord(body) {
  return body.map(entry => {
    const container = {};
    container['word'] = entry.word;
    
    return container;
  });
}
  
module.exports = {
  editedYelpData,
  editedRandomWord
};