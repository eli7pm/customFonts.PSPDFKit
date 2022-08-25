import { useEffect, useRef } from 'react';

import { dataMap } from '../components/Config';
//const dataMap = {};

const userName = 'Дарина Кравчук. Тернопільська ЗОШ №16';
//const userPassword = '';


//var arrData = [];

const fetcher = (fontFileName) =>
  fetch(fontFileName).then((r) => {
    if (r.status === 200) {
      return r.blob();
    } else {
      throw new Error();
    }
  });

export default function PdfViewerComponent(props) {
	const containerRef = useRef(null);
	const customFontsRef = useRef(null);

	useEffect(() => {

		const container = containerRef.current;
		let instance, PSPDFKit;
		(async function () {
			PSPDFKit = await import('pspdfkit');
			const themeFile = PSPDFKit.Theme.DARK;
			const customFonts = ["CENSCBK.TTF"].map(
				(font) => new PSPDFKit.Font({ name: font, callback: fetcher })
			);

			customFontsRef.current = customFontsRef.current || customFonts
			instance = await PSPDFKit.load({

				//Api Key
				//licensekey: 'pdf_live_eSDqTB2aIiliYAbvHfhZVa9YjorkV95d0aXzPpKuEMS',
				licenseKey: "",
				// Container where PSPDFKit should be mounted.
				container,
				// The document to open.
				document: props.document,
				// Theme file
				theme: themeFile,

				autoSaveMode: PSPDFKit.AutoSaveMode.INTELLIGENT,

				customFonts: customFontsRef.current,
				//password: userPassword,
				// Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
				baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
				//password: "secr3t",

				toolbarItems: [
					...PSPDFKit.defaultToolbarItems,
					{
					  type: "form-creator"
					}
				  ],

				// Watermark
				renderPageCallback: function (ctx, pageIndex, pageSize) {
					ctx.font = "14px Arial";
					ctx.fillStyle = "grey";
					ctx.textAlign = "center";

					ctx.fillText(
					  userName,
					  pageSize.width / 2,
					  pageSize.height - 13
					);
				  }


			});





			// Lock print and download
			instance.setToolbarItems(items => items.filter((item) => item.type !== "export-pdf"));
			instance.setToolbarItems(items => items.filter((item) => item.type !== "print"));
			instance.setToolbarItems(items => items.filter((item) => item.type !== "signature"));
			instance.setToolbarItems(items => items.filter((item) => item.type !== "document-editor"));
			instance.setToolbarItems(items => items.filter((item) => item.type !== "document-crop"));
			instance.setToolbarItems(items => items.filter((item) => item.type !== "line"));
			instance.setToolbarItems(items => items.filter((item) => item.type !== "ink-eraser"));
			instance.setToolbarItems(items => items.filter((item) => item.type !== "pan"));
			instance.setToolbarItems(items => items.filter((item) => item.type !== "zoom-mode"));

			instance.setViewState(viewState => (
				viewState.set("layoutMode", "SINGLE")
			));

			instance.setViewState(viewState => (
				viewState.set("scrollMode", "PER_SPREAD")
			));

			instance.setViewState(viewState => (
				viewState.set("ZoomMode", "FIT_TO_VIEWPORT")
			));

			instance.setViewState(viewState => (
				viewState.set("spreadSpacing", 5)
			));

			instance.setFormFieldValues(dataMap);

			instance.addEventListener("viewState.change", (viewState) => {
				console.log(viewState.toJS());
			});


			instance.addEventListener("formFieldValues.update", (viewState) => {
				//console.log(viewState.toJS());
				//console.log('name: '+viewState.toJS()[0].name+'; value: '+viewState.toJS()[0].value);
				dataMap[String(viewState.toJS()[0].name)] = viewState.toJS()[0].value;
				//console.log(dataMap);
			});




		})();

		return () => PSPDFKit && PSPDFKit.unload(container);
	}, );



	return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}
