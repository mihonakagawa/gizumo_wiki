import axios from '@Helpers/axiosDefault';

export default {
  namespaced: true,
  state: {
    loading: false,
    errorMessage: '',
    doneMessage: '',
    categoryList: [],
    deleteCategoryId: null,
    deleteCategoryName: '',
    updateCategoryId: null,
    updateCategoryName: '',
  },
  getters: {
    categoryList: state => state.categoryList,
  },
  actions: {
    postCateogry({ commit, rootGetters }, categoryName) { // `store.getters` と同じ。ただしモジュール内に限る
      commit('toggleLoading');
      const data = new URLSearchParams();
      data.append('name', categoryName);
      // console.log(data.toString());
      return new Promise((resolve) => {
        axios(rootGetters['auth/token'])({
          method: 'POST',
          url: '/category',
          data,
        }).then(() => {
          commit('donePostCategory');
          resolve();
          commit('toggleLoading');
        }).catch((err) => {
          commit('failFetchCategory', { message: err.message });
          commit('toggleLoading');
        });
      });
    },
    clearMessage({ commit }) {
      commit('clearMessage');
    },
    getAllCategories({ commit, rootGetters }, categoryName) {
      return new Promise((resolve, reject) => {
        axios(rootGetters['auth/token'])({
          method: 'GET',
          url: categoryName ? `/article?category=${categoryName}` : '/category',
        }).then((res) => {
          const payload = {
            categories: res.data.categories
            ,
          };
          commit('doneGetAllCategories', payload);
          resolve();
        }).catch((err) => {
          commit('failRequest', { message: err.message });
          reject();
        });
      });
    },
    editedCategoryName({ commit }, categoryName) {
      commit('editedCategoryName', { categoryName });
    },
    deleteCategory({ commit, rootGetters }, categoryId) {
      // console.log(categoryId);
      return new Promise((resolve) => {
        axios(rootGetters['auth/token'])({
          method: 'DELETE',
          url: `/category/${categoryId}`,
        }).then((response) => {
          // NOTE: エラー時はresponse.data.codeが0で返ってくる。
          if (response.data.code === 0) throw new Error(response.data.message);
          commit('doneDeleteCategory');
          resolve();
        }).catch((err) => {
          commit('failFetchCategory', { message: err.message });
        });
      });
    },
    updateDeleteCategory({ commit }, categoryData) {
      // console.log(categoryData.categoryId);
      commit('updateDeleteCategory', categoryData);
    },
    getCategoryDetail({ commit, rootGetters }, categoryId) { //  ここでカテゴリーネームを引っ張ってきて更新ボタン押したときに表示させる
      const { id } = categoryId; //  ここでオブジェクトをstringに変えてる
      // console.log(typeof id);
      axios(rootGetters['auth/token'])({
        method: 'GET',
        url: `/category/${id}`,
      }).then((response) => {
        const responseData = response.data.category;
        commit('doneGetCategoryDetail', responseData);
      }).catch((err) => {
        commit('failFetchCategory', { message: err.message });
      });
    },
    updateCategory({ commit, rootGetters }) {
      commit('toggleLoading');
      // console.log(rootGetters['auth/token']);
      const data = new URLSearchParams();
      data.append('id', this.state.categories.updateCategoryId);
      data.append('name', this.state.categories.updateCategoryName);
      axios(rootGetters['auth/token'])({
        method: 'PUT',
        url: `/category/${this.state.categories.updateCategoryId}`,
        data,
      }).then((response) => {
        const payload = response.data.category;
        // console.log(payload);
        commit('doneUpdateCategory', payload);
        commit('toggleLoading');
      }).catch((err) => {
        commit('failFetchCategory', { message: err.message });
        commit('toggleLoading');
      });
    },

  },
  mutations: {
    updateDeleteCategory(state, payload) {
      state.deleteCategoryId = payload.categoryId;
      state.deleteCategoryName = payload.categoryName;
      // console.log(state.deleteCategoryId);
      // console.log(state.deleteCategoryName);
    },
    donePostCategory(state) {
      state.doneMessage = 'カテゴリーの追加が完了しました';
    },
    clearMessage(state) {
      state.errorMessage = '';
      state.doneMessage = '';
    },
    doneGetAllCategories(state, { categories }) {
      state.categoryList = [...categories];
    },
    failFetchCategory(state, { message }) {
      state.errorMessage = message;
    },
    toggleLoading(state) {
      state.loading = !state.loading;
    },
    doneDeleteCategory(state) {
      state.deleteCategoryId = null;
      state.deleteCategoryName = '';
      state.doneMessage = 'カテゴリーの削除が完了しました。';
    },
    doneGetCategoryDetail(state, payload) {
      state.updateCategoryId = payload.id;
      state.updateCategoryName = payload.name;
    },
    doneGetDeleteCategoryDetail(state, payload) {
      state.deleteCategoryId = payload.id;
      state.deleteCategoryName = payload.name;
    },
    editedCategoryName(state, { categoryName }) {
      state.updateCategoryName = categoryName;
    },
    doneUpdateCategory(state, payload) {
      state.updateCategoryId = payload.id;
      state.updateCategoryName = payload.name;
      state.doneMessage = 'カテゴリーの更新が完了しました。';
    },
  },
};
