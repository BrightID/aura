import { mount } from './mount';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

mount(root);
