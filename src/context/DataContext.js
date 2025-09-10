import React, { createContext, useContext, useReducer } from 'react';

const DataContext = createContext();

const initialState = {
  data: null,
  columns: [],
  tableName: '',
  query: '',
  results: [],
  loading: false,
  error: null,
  dataSource: null, // 'google-sheets', 'excel', 'csv'
  spreadsheetId: '',
  sheetName: '',
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload.data,
        columns: action.payload.columns,
        tableName: action.payload.tableName,
        error: null,
      };
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload,
      };
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_DATA_SOURCE':
      return {
        ...state,
        dataSource: action.payload,
      };
    case 'SET_SPREADSHEET_INFO':
      return {
        ...state,
        spreadsheetId: action.payload.spreadsheetId,
        sheetName: action.payload.sheetName,
      };
    case 'CLEAR_DATA':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const value = {
    ...state,
    dispatch,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
