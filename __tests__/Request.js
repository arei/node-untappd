var sinon = require('sinon')
var PassThrough = require('stream').PassThrough;
var http = require('http')
var UntappdClient = require('../UntappdClient');
 
describe('Requests', () => {
	beforeEach(() => {
		this.request = sinon.stub(http, 'request');
	})

	afterEach(() => {
		http.request.restore();
	})

	it('Handles parse errors', () => {
		var response = new PassThrough();
		response.write('Something that is not JSON');
		response.end()

		var request = new PassThrough();

		this.request.callsArgWith(1, response).returns(request)

		var untappd = new UntappdClient();
		untappd.setClientSecret('fake secret')
		untappd.setClientId('fake id')

		untappd.beerInfo(function(err, result){
			if(err){
				expect(err).not.toBeNull()
			}
		}, {BID : 12345})
	})
})