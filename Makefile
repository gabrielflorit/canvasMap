clean:

	rm -rf data/*


all: clean

	# download boston shapefile
	cd data; curl -o boston_unprojected.geojson https://raw.github.com/gabrielflorit/shapefiles/master/MA/Boston/Boston.geojson

	# download MA census blocks
	cd data; curl -o blocks.zip ftp://ftp2.census.gov/geo/tiger/TIGER2010BLKPOPHU/tabblock2010_25_pophu.zip; unzip blocks.zip

	# make map of boston-only blocks
	cd data; ogr2ogr -f GeoJSON -clipsrc boston_unprojected.geojson -where 'COUNTYFP10 = "025"' blocks_unprojected.geojson *.shp

	# project blocks to MA albers
	cd data; ogr2ogr -f GeoJSON -t_srs "+proj=aea +lat_1=41.237962 +lat_2=42.886818 +lat_0=42.25841962 +lon_0=-71.81532837 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs" blocks.geojson blocks_unprojected.geojson

	# project boston map to MA albers
	cd data; ogr2ogr -f GeoJSON -t_srs "+proj=aea +lat_1=41.237962 +lat_2=42.886818 +lat_0=42.25841962 +lon_0=-71.81532837 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs" boston.geojson boston_unprojected.geojson

	# combine boston map, blocks map
	cd data; topojson --id-property BLOCKID10 --cartesian --width 1024 -o blocks.topojson boston.geojson blocks.geojson

	# turn json into js
	cd data; { echo 'var blocks_topojson='; cat blocks.topojson; echo ';'; } > blocks.js
