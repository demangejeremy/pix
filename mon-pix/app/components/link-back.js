import Component from '@glimmer/component';

export default class PixLinkBackComponent extends Component {
  text = 'pix-link-back';

  get getColor() {
    const colorParam = this.args.color;
    const correctsColors = ['white', 'black'];
    return correctsColors.includes(colorParam) ? colorParam : 'black';
  }
}
