import axios from '@Helpers/axiosDefault';

export default {
  namespaced: true,
  state: {
    targetCategoryName: '',
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
    clearMessage({ commit }) {
      commit('clearMessage');
    },
    getAllCategories({ commit, rootGetters }) {
      axios(rootGetters['auth/token'])({
        method: 'GET',
        url: '/category',
      }).then((response) => {
        const payload = { categories: [] };
        response.data.categories.forEach((val) => {
          payload.categories.push(val);
        });
        commit('doneGetAllCategories', payload);
      }).catch((err) => {
        commit('failFetchCategory', { message: err.message });
      });
    },
    confirmDeleteCategory({ commit }, { categoryId, categoryName }) {
      commit('confirmDeleteCategory', { categoryId, categoryName });
    },
    deleteCategory({ commit, rootGetters }, categoryId) {
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
    postCategory({ commit, rootGetters }, targetCategoryName) {
      return new Promise((resolve, reject) => {
        commit('clearMessage');
        commit('toggleLoading');
        const data = new URLSearchParams();
        data.append('name', targetCategoryName);
        axios(rootGetters['auth/token'])({
          method: 'POST',
          url: '/category',
          data,
        }).then(() => {
          commit('toggleLoading');
          commit('doneTargetCategory', { targetCategoryName });
          resolve();
        }).catch((err) => {
          commit('toggleLoading');
          commit('failFetchCategory', { message: err.message });
          reject();
        });
      });
    },
    getCategoryDetail({ commit, rootGetters }, updateCategoryId) {
      return new Promise((resolve, reject) => {
        commit('clearMessage');
        commit('toggleLoading');
        const data = new URLSearchParams();
        data.append('name', updateCategoryId);
        axios(rootGetters['auth/token'])({
          method: 'GET',
          url: '/category',
          data,
        }).then(() => {
          commit('toggleLoading');
          commit('confirmCategoryDetail', { updateCategoryId });
          resolve();
        }).catch((err) => {
          commit('toggleLoading');
          commit('failFetchCategory', { message: err.message });
          reject();
        });
      });
    },
    // updateCategory({ commit, rootGetters }, updateCategoryName) {
    //   return new Promise((resolve, reject) => {
    //     commit('clearMessage');
    //     commit('toggleLoading');
    //     const data = new URLSearchParams();
    //     data.append('id', updateCategoryId);
    //     axios(rootGetters['auth/token'])({
    //       method: 'PUT',
    //       url: '/category',
    //       data,
    //     }).then(() => {
    //       commit('toggleLoading');
    //       // commit('updateCategory', { response });
    //       resolve();
    //     }).catch((err) => {
    //       commit('toggleLoading');
    //       commit('failFetchCategory', { message: err.message });
    //       reject();
    //     });
    //   });
    // },
  },
  mutations: {
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
    confirmCategoryDetail(state, { categoryId }) {
      state.updateCategoryId = categoryId;
    },
    confirmDeleteCategory(state, { categoryId, categoryName }) {
      state.deleteCategoryId = categoryId;
      state.deleteCategoryName = categoryName;
    },
    doneDeleteCategory(state) {
      state.deleteCategoryId = null;
      state.deleteCategoryName = '';
      state.doneMessage = 'カテゴリーの削除が完了しました。';
    },
    doneTargetCategory(state) {
      state.doneMessage = 'カテゴリーの追加が完了しました。';
    },
  },
};
