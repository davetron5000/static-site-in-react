export default class Copyright {
  constructor() {
    let originalYear = 2019;
    let thisYear = (new Date()).getYear() + 1900;
    if (originalYear === thisYear) {
      this.string = `${originalYear}`
    }
    else {
      this.string = `${originalYear}–${thisYear}`
    }
  }
}
