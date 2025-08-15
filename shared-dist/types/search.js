"use strict";
/**
 * Search-related types for predictive text and suggestions
 * Used across web and mobile platforms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSuggestionType = void 0;
// Types of search suggestions
var SearchSuggestionType;
(function (SearchSuggestionType) {
    SearchSuggestionType["QUERY_COMPLETION"] = "query_completion";
    SearchSuggestionType["POPULAR_SEARCH"] = "popular_search";
    SearchSuggestionType["RECENT_SEARCH"] = "recent_search";
    SearchSuggestionType["CATEGORY"] = "category";
    SearchSuggestionType["BRAND"] = "brand";
    SearchSuggestionType["LOCATION"] = "location";
    SearchSuggestionType["ITEM_NAME"] = "item_name";
    SearchSuggestionType["CORRECTION"] = "correction";
    SearchSuggestionType["RELATED"] = "related";
})(SearchSuggestionType || (exports.SearchSuggestionType = SearchSuggestionType = {}));
