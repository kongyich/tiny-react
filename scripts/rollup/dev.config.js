import reactConfig from './react.config';
import reactDOMConfig from './react-dom.config';

export default () => {
	return [...reactConfig, ...reactDOMConfig];
};
