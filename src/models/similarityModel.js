function calculateGlobalSimilarityValue(textSimilarity, citationSimilarity, imageSimilarity, formulaSimilarity) {
    return (textSimilarity/4 + citationSimilarity/4 + imageSimilarity/4 + formulaSimilarity/4);
}

function globalSimilarityComparison( a, b ) {
    const globalSimA = calculateGlobalSimilarityValue(a.similarities.text, a.similarities.citation, a.similarities.image, a.similarities.text);
    const globalSimB = calculateGlobalSimilarityValue(b.similarities.text, b.similarities.citation, b.similarities.image, b.similarities.text);
    if ( globalSimA < globalSimB ){
      return 1;
    }
    if ( globalSimA > globalSimB ){
      return -1;
    }
    return 0;
}


module.exports = {
    getGlobalSimilarityValue: function(textSimilarity, citationSimilarity, imageSimilarity, formulaSimilarity) {
        return calculateGlobalSimilarityValue(textSimilarity, citationSimilarity, imageSimilarity, formulaSimilarity);
    },
    getSortedViaGlobalSimilarityValueWithMaxNumberOfDocuments: function(matchedDocumentsList, maxNumberOfDocuments) {
        var copiedArray = matchedDocumentsList.concat();
        console.log("--- max: "+maxNumberOfDocuments)
        console.log(copiedArray.sort(globalSimilarityComparison).slice(0, maxNumberOfDocuments))
        console.log("---")
        return copiedArray.sort(globalSimilarityComparison).slice(0, maxNumberOfDocuments);
    }
}