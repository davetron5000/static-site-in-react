import fs             from "fs"
import Logger        from "./Logger"
import FileCopyResult from "./FileCopyResult"
import FileRecurser   from "./FileRecurser"

export default class SiteData {
  constructor(from_dir, to_dir) {
    this.from_dir = from_dir
    this.to_dir = to_dir
    this.file_recurser = new FileRecurser()
  }

  get_derived_data() {
    let derived_data = { pages: [] }

    this.file_recurser.recurse(this.from_dir, this.to_dir, (file_to_copy) => {

      const result = new FileCopyResult("derive site data", file_to_copy)
      if (file_to_copy.is_html()) {
        const metadata = file_to_copy.metadata()
        derived_data.pages.push(metadata)
        result.set_action("adding to pages", `is an HTML file with metadata: ${JSON.stringify(metadata)}`)
      }
      else {
        result.set_action("ignoring", "not an HTML file")
      }
      Logger.log(result.toString());

      return result;
    });

    Logger.log(`Derived site data:\n${JSON.stringify(derived_data,null,'  ')}`)

    let user_supplied_site_data = {};
    if (fs.existsSync("site_data.json")) {
      user_supplied_site_data = JSON.parse(fs.readFileSync("site_data.json"))
      Logger.log(`site_data.json not found and parsed as:\n${JSON.stringify(user_supplied_site_data,null,'  ')}`)
    }
    else {
      Logger.log("site_data.json not found - No user-supplied data")
    }

    derived_data = Object.assign(derived_data, user_supplied_site_data)
    Logger.log(`Derived and merged site data:\n${JSON.stringify(derived_data,null,'  ')}`)

    return derived_data
  }
}
