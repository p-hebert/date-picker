# DatePicker

An easy, out of the box date picker allowing the user to pick dates in four different
scales, from day to year.

## Getting Started { Production }

### Method 1: Clone the Repository

#### 1. Clone the Repository

Change directory to the directory of your choice and then clone this repository
using `git clone https://<username>@bitbucket.org/exekutiveco/exekutive-suite-date-picker.git <folder-name>`
where `<username>` is your username and `<folder-name>` is the folder where you want
to clone the repo.

#### 2. Add the dist files to your project

DatePicker does not have any external dependencies to any other libraries. As
such you can directly import the javascript and css from the `dist/` folder in
your HTML:

```
<!DOCTYPE html>
<html lang="en">

<head>
  <link rel="stylesheet" type="text/css" href="./date-picker.css">
  <script src="./date-picker.js"></script>
</head>
<body>
  ...
</body>
</html>
```

#### 3. Call the DatePicker Constructor

DatePicker is simple to use. All you need to do is call
`new DatePicker();` and a DatePicker will be automatically generated. You can also
pass some options, such as boundary dates, target HTMLElement, etc. See the
**API** section for more details.

### Method 2: Use Bower

#### 1. Add repository as dependency

Run the following command:

`bower install 'https://bitbucket.org/exekutiveco/exekutive-suite-date-picker.git' --save`

#### 2. Add the dist files to your project

DatePicker does not have any external dependencies to any other libraries. As
such you can directly import the javascript and css from the `dist/` folder in
your HTML:

```
<!DOCTYPE html>
<html lang="en">

<head>
  <link rel="stylesheet" type="text/css" href="./bower_components/exekutive-suite-date-picker/dist/date-picker.css">
  <script src="./bower_components/exekutive-suite-date-picker/dist/date-picker.js"></script>
</head>
<body>
  ...
</body>
</html>
```

#### 3. Call the DatePicker Constructor

DatePicker is simple to use. All you need to do is call
`new DatePicker();` and a DatePicker will be automatically generated. You can also
pass some options, such as boundary dates, target HTMLElement, etc. See the
**API** section for more details.

## Getting Started { Development }

#### 1. Clone the repository

Change directory to the directory of your choice and then clone this repository
using `git clone https://<username>@bitbucket.org/exekutiveco/exekutive-suite-date-picker.git <folder-name>`
where `<username>` is your username and `<folder-name>` is the folder where you want
to clone the repo.

#### 2. Install build dependencies

1. Run `npm install` to install all node dependencies. You must have the node package
manager installed in order for this to work.
2. Run `bower install` to install all bower dependencies. bower will be installed
by default after the npm install.

#### 3. Build via Gulp

Currently the gulpfile only has one command, the default command. As such run `gulp`
in order to build the javascript.

You will find the javascript and compiled scss under `src/` as `date-picker.js` and
`date-picker.css`

## API

### Options Parameters

| Parameter     | type                  | Description                              | Defaults to  |
| ------------- | --------------------- | ---------------------------------------- | ------------ |
| `date`        | Date                  | Default date to be displayed             | new Date()   |
| `min_date`    | Date                  | Minimum date allowed for the date picker | undefined    |
| `max_date`    | Date                  | Maximum date allowed for the date picker | undefined    |
| `scale`       | string                | First scale to be shown. Valid values are 'day', 'week', 'month', 'year' | 'day' |
| `parent`      | string or HTMLElement | Either a selector supported by [`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) or an HTMLElement. | 'body' |
| `lang`        | string                | Language of the DatePicker. Currently only English and French are supported | 'en' |
| `icons`       | object                | Arrow icons used for the DatePicker. If you feel like a change of style, you can change those. However make sure to follow the default structure or your icons won't show up. | <see below> |

#### `icons` Default

~~~~
{
  "arrow-prev-big": '<svg>...</svg>',
  "arrow-next-big": '<svg>...</svg>',
  "arrow-prev-small": '<svg>...</svg>',
  "arrow-next-small": '<svg>...</svg>'
}
~~~~

#### A Note on Options

All options passed are deep-copied, and as such the options object you pass will
not be tied to the DatePicker. Any modification on the options object will not
affect the DatePicker inner state.

### API Calls

| Method        | Description                              | Stable?      |
| ------------- | ---------------------------------------- | ------------ |
| `setDate(Date: date)`     | Sets the date of the DatePicker          | **No**       |
| `setMinDate(Date: date)`  | Sets the max date of the DatePicker      | **No**       |
| `setMaxDate(Date: date)`  | Sets the min date of the DatePicker      | **No**       |
| `changeScale(string: scale)` | Changes the scale of the DatePicker      | **Yes**      |
| `addEventListener(string: e, function: callback)` | Adds an event listener to the specified event. Event must be available in `DatePicker.prototype.enum.callbacks`. See note below for more details. | **Yes**      |
| `getComponent(string: comp)` | Returns the requested component. Must be listed in `DatePicker.prototype.enum.components` | **Yes** |

#### Notes on API

- `addEventListener(string: e, function: callback)`: Can only listen to
  DatePicker events. To listen on component events, use
  `getComponent(component).registerCallback(e, callback)` where `e` is available in the
  component's prototype.enum.callbacks. Support for component event listening is
  not standardized.
- `getComponent(string: comp)`: Modifying the inner state of components will result in
  inconsistencies, so be careful with what you aim to do with this. Moreover if you are
  using the minified version prototype names are mangled.

### Planned API Features

| Method                              | Description                                             |
| ----------------------------------- | ------------------------------------------------------- |
| `addEventListener(e, callback)`     | Listens on one of the internal events of the datepicker |


## Currently Known Issues

- Most components won't work if no max/min are specified.
- Max/Min cannot be changed on the fly yet
- Changing from one week to another through the PickerControls will result in
  the week calendar failing to update correctly if the week is completely in
  the following month from the one displayed but is displayed as a sixth row
  in the calendar view.
- Changing from one day to another through the PickerControls when in the day
  scale does not update the calendar view.
- It is suspected that the PickerControls could introduce a way to go beyond
  the boundaries (max/min) if an inconsistency is found.
- The French version is buggy at best.

## Authorship

- Design and UX by @gregorybp
- Markup and styling by @guillaume-t95
- Javascript by @p-hebert

### Other Notes

- DateUtils.formatDate can be moved to another repository and modified for self-containment
  and then posted to [this SO post](http://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date)
