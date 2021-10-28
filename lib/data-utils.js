function editedYelpData(body) {
  return body.map(entry => {
    const container = {};
    container['name'] = entry.name;
    container['category'] = entry.categories
    // not sure this was working how you wanted it to. According to my recollection, the strings end up evaluated as truthy, and so everything ends up being included
      .filter(category => category.title === 'Parks' || category.title === 'Pet Groomers' || category.title === 'Pet Photography' || category.title === 'Pet Adoption');
    container['url'] = entry.url;
    container['distance'] = Math.round((((entry.distance) * 0.00062137)) * 100) / 100;
    return container;
  });
}

function editedRandomWord(body) {
  // seems like this should do the same thing?
  return body.map(entry => ({ word: entry.word }));
}
  
module.exports = {
  editedYelpData,
  editedRandomWord
};